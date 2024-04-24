import React, { useState, useMemo, useEffect } from 'react';
import { styled } from 'styled-components';
import { Divider, Form, Input, InputNumber, Col, Row, Upload, Switch, Alert, Button, Modal, Tooltip } from 'antd';
import { PlusOutlined, InfoCircleFilled } from '@ant-design/icons';
import toast from 'react-hot-toast';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createGenericFileFromBrowserFile } from '@metaplex-foundation/umi';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { nftStorageUploader } from '@metaplex-foundation/umi-uploader-nft-storage';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { getBase64 } from '../utils/image';
import LoadingModal from '../components/loadingModal';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  AuthorityType,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
} from '@solana/spl-token';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { createMetadataAccountV3, MPL_TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsPublicKey, toWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { useAppContext } from '../store/appProvider';

const RowGutter = { xs: 8, sm: 16, md: 24, lg: 32 };

const MAX_FILE_SIZE = 2; // 2Mb

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    toast.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 <= MAX_FILE_SIZE;
  if (!isLt2M) {
    toast.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const LogoUpload = ({ value, onChange }) => {
  const [imageData, setImageData] = useState(value);
  const onUpload = async ({ file }) => {
    onChange(file);
  };

  useEffect(() => {
    value && getBase64(value).then((d) => setImageData(d));
  }, [value]);

  return (
    <UploadBox>
      <Upload
        accept="image/png, image/jpeg"
        listType="picture-card"
        beforeUpload={beforeUpload}
        customRequest={(option) => onUpload(option)}
        showUploadList={false}
      >
        {imageData ? (
          <img
            src={imageData}
            alt="avatar"
            style={{
              width: '100%',
            }}
          />
        ) : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>
    </UploadBox>
  );
};

const SwitchItem = ({ value, onChange, name, desc }) => {
  return (
    <Card>
      <div>{name}</div>
      <Tooltip placement="top" title={desc}>
        <InfoCircleFilled />
      </Tooltip>
      <Switch onChange={(v) => onChange(v)} style={{ marginLeft: '20px' }} />
    </Card>
  );
};

const TOKEN = import.meta.env.VITE_UPLOADER_TOKEN;

export default function IssueToken() {
  const [loadingText, setLoadingText] = useState(false);
  const [form] = Form.useForm();
  const [fileData, setFileData] = useState();
  const [metaData, setMetaData] = useState();
  const [txHash, setTxHash] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const { network } = useAppContext();

  const { connection } = useConnection();
  const wallet = useWallet();

  const umi = useMemo(() => {
    return !wallet.connected
      ? null
      : createUmi(connection.rpcEndpoint)
          .use(walletAdapterIdentity(wallet))
          .use(nftStorageUploader({ token: TOKEN }));
  }, [connection.rpcEndpoint, wallet.connected]);

  const uploadLogo = async (imgFile) => {
    if (imgFile.name === fileData?.name && fileData.uri) {
      return fileData.uri;
    }
    const genericFile = await createGenericFileFromBrowserFile(imgFile);
    const uris = await umi.uploader.upload([genericFile]);
    setFileData({
      name: imgFile.name,
      uri: uris[0],
    });
    return uris[0];
  };

  const uploadMetadata = async (data) => {
    console.log('metadata:', data);
    const str = JSON.stringify(data);
    if (str === metaData?.dataStr && metaData.uri) {
      return metaData.uri;
    }
    // covert json to json file
    const blob = new Blob([str], { type: 'application/json' });
    const file = new File([blob], `${data.name}.json`, { type: 'application/json' });
    // upload
    const genericFile = await createGenericFileFromBrowserFile(file);
    const uris = await umi.uploader.upload([genericFile]);
    setMetaData({
      dataStr: str,
      uri: uris[0],
    });
    return uris[0];
  };

  const createToken = async (values, uri) => {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const mintKeypair = Keypair.generate();
    const publicKey = wallet.publicKey;
    const tokenATA = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata', 'utf-8'),
        new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString()).toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString()),
    );

    //The tx builder expects the type of mint authority and signer to be `Signer`, so built a dummy Signer instance
    const signer = {
      publicKey: fromWeb3JsPublicKey(publicKey),
      signTransaction: null,
      signMessage: null,
      signAllTransactions: null,
    };

    //Metadata account IX Accounts
    const accounts = {
      metadata: fromWeb3JsPublicKey(metadata),
      mint: fromWeb3JsPublicKey(mintKeypair.publicKey),
      payer: signer,
      mintAuthority: signer,
      updateAuthority: fromWeb3JsPublicKey(publicKey),
    };
    const args = {
      data: {
        name: values.name,
        symbol: values.symbol,
        description: values.desc,
        uri: uri,
        creators: null,
        sellerFeeBasisPoints: 0,
        uses: null,
        collection: null,
      },
      isMutable: !!values.immutable,
      collectionDetails: null,
    };

    const metadataBuilder = createMetadataAccountV3(umi, { ...accounts, ...args });
    const metadataInstruction = metadataBuilder.getInstructions()[0];
    metadataInstruction.keys = metadataInstruction.keys.map((key) => {
      const newKey = { ...key };
      newKey.pubkey = toWeb3JsPublicKey(key.pubkey);
      return newKey;
    });

    const closeMintAuthorityInstruction = createSetAuthorityInstruction(
      TOKEN_PROGRAM_ID,
      mintKeypair.publicKey,
      AuthorityType.MintTokens,
      null,
      [],
    );

    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        Number(values.decimals),
        publicKey, // mintAuthority
        values.freezeAuthority ? null : publicKey,
        TOKEN_PROGRAM_ID,
      ),
      createAssociatedTokenAccountInstruction(publicKey, tokenATA, publicKey, mintKeypair.publicKey),
      createMintToInstruction(
        mintKeypair.publicKey,
        tokenATA,
        publicKey, // mintAuthority,
        Number(values.supply) * Math.pow(10, Number(values.decimals)),
      ),
      metadataInstruction,
    );
    if (!!values.mintAuthority) {
      console.log('=== close mint authority ===');
      tx.add(closeMintAuthorityInstruction);
    }

    const txResult = await wallet.sendTransaction(tx, connection, { signers: [mintKeypair] });
    console.log('txResult:', txResult);
    return txResult;
  };

  const onSubmit = async (values) => {
    console.log('submit:', values);
    if (!umi) {
      toast.error('Please connect wallet first!');
      return;
    }
    setLoadingText('uploading logo...');
    let logoUri;
    try {
      logoUri = await uploadLogo(values.logo);
    } catch (error) {
      console.error(error);
      toast.error(`upload logo failed: ${error}`);
      setLoadingText(false);
      return;
    }
    setLoadingText('uploading metadata...');
    let metadataUri;
    try {
      metadataUri = await uploadMetadata({
        name: values.name,
        symbol: values.symbol,
        decimals: Number(values.decimals),
        image: logoUri,
        description: values.desc,
        // extensions: {
        //   twitter: values.twitter,
        //   telegram: values.telegram,
        //   site: values.site,
        // },
      });
      console.log('metadataUri: ', metadataUri);
    } catch (error) {
      console.error(error);
      toast.error(`upload metadata failed: ${error}`);
      setLoadingText(false);
      return;
    }
    setLoadingText('creating token...');

    try {
      const txResult = await createToken(values, metadataUri);
      setTxHash(txResult);
      form.resetFields();
    } catch (error) {
      console.error(error);
      toast.error(`create failed: ${error}`);
    } finally {
      setLoadingText(false);
    }
  };

  const txLink = useMemo(() => {
    if (!txHash) {
      return '';
    }
    let cluster = '';
    if (network !== 'mainnet-beta') {
      cluster = `?cluster=${network}`;
    }
    return {
      tx: `https://explorer.solana.com/tx/${txHash}${cluster}`,
      token: `https://explorer.solana.com/address/${tokenAddress}${cluster}`,
    };
  }, [network, txHash, tokenAddress]);

  return (
    <div>
      <div>
        <h1>Issue Token</h1>
      </div>

      <TipBox>
        <p>
          <span style={{ fontSize: '16px' }}>
            <strong>·</strong>
          </span>{' '}
          The process of creating tokens is significantly influenced by the local network environment. If it continues
          to fail, try switching to a more stable network or activate the global mode of a VPN before proceeding with
          the operation.
        </p>
        <p
          style={{
            marginTop: '12px',
          }}
        >
          <span style={{ fontSize: '16px' }}>
            <strong>·</strong>
          </span>{' '}
          Solana Network Congestion: The Solana network is currently experiencing congestion. If the program is not
          functioning properly or if errors occur, please try again.
        </p>
      </TipBox>

      <Form layout="vertical" onFinish={onSubmit} form={form}>
        <Row gutter={RowGutter}>
          <Col span={12}>
            <Form.Item name="name" label="Token Name" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="symbol" label="Token Symbol" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={RowGutter}>
          <Col span={12}>
            <Form.Item name="decimals" label="Decimais" rules={[{ required: true }]}>
              <InputNumber size="large" style={{ width: '100%' }} step={1} min={1} stringMode precision={0} />
            </Form.Item>
            <Form.Item name="supply" label="Supply" rules={[{ required: true }]}>
              <InputNumber size="large" style={{ width: '100%' }} step={1} min={1} stringMode precision={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="logo" label="Token Logo" rules={[{ required: true }]}>
              <LogoUpload />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item name="desc" label="Token Description" rules={[{ required: false }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={RowGutter}>
          <Col span={8}>
            <Form.Item name="immutable">
              <SwitchItem
                name="Immutable"
                desc="Renouncing ownership means you will not be able to modify the token metadata. It indeed makes investors
              feel more secure."
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="freezeAuthority">
              <SwitchItem
                name="Relinquish Freezing Right"
                desc="Creating a liquidity pool requires relinquishing freezing rights, meaning you can't freeze tokens in
              holder wallets."
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="mintAuthority">
              <SwitchItem
                name="Relinquish Minting Right"
                desc="Relinquishing minting rights is essential for investor security and token success, preventing further
              token supply."
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <CreateOperator>
            <div>
              <Button type="primary" htmlType="submit" style={{ width: 200 }} size="large">
                Create Token
              </Button>
            </div>
            {/* <CreateTip>The lowest service fee on the entire network is 0.1 SOL.</CreateTip> */}
          </CreateOperator>
        </Form.Item>
      </Form>
      {loadingText && <LoadingModal text={loadingText} />}
      {txHash && (
        <Modal
          title="Successfully"
          open={!!txHash}
          footer={null}
          onCancel={() => {
            setTxHash('');
            setTokenAddress('');
          }}
        >
          <TxLinkBlock>
            <h4>Transaction hash: </h4>
            <a target="_blank" href={txLink?.tx}>
              {txHash}
            </a>
          </TxLinkBlock>
          {/* <TxLinkBlock>
            <h4>Token Address: </h4>
            <a target="_blank" href={txLink?.token}>
              {tokenAddress}
            </a>
          </TxLinkBlock> */}
        </Modal>
      )}
    </div>
  );
}

const UploadBox = styled.div`
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  padding-block: 16px;
  display: flex;
  justify-content: center;
  &:hover {
    border-color: #704eb5;
  }
`;

const CardBox = styled.div`
  display: flex;
  gap: 20px;
  align-items: stretch;
  margin-bottom: 24px;
`;

const Card = styled.div`
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const CreateTip = styled.div`
  text-align: center;
  color: rgba(0, 0, 0, 0.3);
  font-size: 12px;
`;

const CreateOperator = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

const TxLinkBlock = styled.div`
  margin-block: 10px;
`;

const TipBox = styled.div`
  border-radius: 8px;
  background-color: #efefef;
  padding: 11px;
  margin-top: 24px;
  margin-bottom: 36px;
  color: #666;
`;
