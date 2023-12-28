import {Alert, Button, Flex, Form, Input, message, Steps, Upload,Col} from "antd";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import {useMemo, useState} from "react";
import {nftStorageUploader} from "@metaplex-foundation/umi-uploader-nft-storage";
import {createNft, mplTokenMetadata} from "@metaplex-foundation/mpl-token-metadata";
import {createGenericFileFromBrowserFile, generateSigner, percentAmount} from "@metaplex-foundation/umi";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import styled from "styled-components";

const { TextArea } = Input;

const FlexBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 1200px;

`

const UploadBox = styled.div`
    margin:30px 0;
`

const FormBox = styled.div`
    width: 100%;
`

const BtnBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`

const AlertBox = styled.div`
    margin-top: 40px;
`

const TextBox = styled.div`
    margin: 40px 0;
`

const BtmBox= styled.div`
    margin-bottom: 40px;
    background: #f5f5f5;
    padding: 20px;
`

const TOKEN = import.meta.env.VITE_UPLOADER_TOKEN;
const MAX_FILE_SIZE = 2; // M

const getBase64 = async (img) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
           resolve(reader.result)
        });
        reader.addEventListener('error', () => {
            reject("file reader error")
        });
        reader.readAsDataURL(img);
    })
};

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

export default function Home({cluster}) {
    const [imageUrl, setImageUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [step, setStep] = useState(-1)
    const [stepStatus, setStepStatus] = useState(["", "", ""])
    const [nftUrl, setNftUrl] = useState("")
    const [form] = Form.useForm();
    const [obj,setObj] = useState(null);
    const [uri,setUri] = useState('');

    const { connection } = useConnection();
    const wallet = useWallet();

    console.log()
    const umi = useMemo(()=>{

        return !wallet.connected ? null : createUmi(connection.rpcEndpoint)
            .use(walletAdapterIdentity(wallet))
            .use(nftStorageUploader({token: TOKEN}))
            .use(mplTokenMetadata())
    }, [connection.rpcEndpoint, wallet.connected])

    const onFinish = async (values) => {
        if (loading) {
            return;
        }
        if (!imageFile) {
            toast.error("Please choose image file first!")
            return;
        }
        if (!umi) {
            toast.error("Please connect wallet first!")
            return;
        }
        console.log(values);

        setLoading(true)
        try {
            await create(values)
        } catch (e) {
            console.log(e)
        }
        setLoading(false)

    };

    const create = async (values) => {
        const {name, symbol, description, royalty} = values;
        setStepStatus([])

        // 1. upload image file
        let imageUrl;
        try {
            setStep(0)
            setStepStatus(stepStatus => {
                stepStatus[0] = "process"
                return stepStatus;
            })
            const genericFile = await createGenericFileFromBrowserFile(imageFile);
            const myUris = await umi.uploader.upload([genericFile])

            if (myUris && myUris.length > 0) {
                imageUrl = myUris[0]
            }
            if (!imageUrl) {
                setStepStatus(stepStatus => {
                    stepStatus[0] = "error"
                    return stepStatus;
                })

                toast.error("Image upload failed")
                return;
            } else {
                setStepStatus(stepStatus => {
                    stepStatus[0] = "finish"
                    return stepStatus;
                })
            }
            console.log("image url: ", imageUrl)
        } catch (e) {
            console.error(e)
            setStepStatus(stepStatus => {
                stepStatus[0] = "error"
                return stepStatus;
            })
            return;
        }


        // 2. upload json file
        let jsonUrl
        try {
            setStep(1)
            setStepStatus(stepStatus => {
                stepStatus[1] = "process"
                return stepStatus;
            })
            let obj={name, description, image: imageUrl}
            setObj(JSON.stringify(obj,null,4))
            jsonUrl = await umi.uploader.uploadJson(obj)
            setUri(jsonUrl)
            setStepStatus(stepStatus => {
                stepStatus[1] = "finish"
                return stepStatus;
            })
            console.log("json url: ", jsonUrl)
        } catch (e) {
            console.error(e)
            setStepStatus(stepStatus => {
                stepStatus[1] = "error"
                return stepStatus;
            })
            return
        }

        // 3. create nft
        try {
            setStep(2)
            setStepStatus(stepStatus => {
                stepStatus[2] = "process"
                return stepStatus;
            })
            const mint = generateSigner(umi);
            const result = await createNft(umi, {
                mint,
                name: name,
                symbol: symbol,
                uri: jsonUrl,
                sellerFeeBasisPoints: percentAmount(royalty?royalty/100:0),
            }).sendAndConfirm(umi)
            console.log(result)
            setStepStatus(stepStatus => {
                stepStatus[2] = "finish"
                return stepStatus;
            })
            setNftUrl(`https://explorer.solana.com/address/${mint.publicKey}?cluster=${cluster}`)
        } catch (e) {
            console.error(e)
            setStepStatus(stepStatus => {
                stepStatus[2] = "error"
                return stepStatus;
            })
            return;
        }

    }



    const onUpload = async ({file})=> {
        setImageUrl("")
        setLoading(true)
        try {
            const base64 = await getBase64(file)
            setImageUrl(base64)
            setImageFile(file)


        } catch (e) {
            console.log(e)
        }
        setLoading(false)
    }


    return (
        <FlexBox>
            <Steps
                current={step}
                status={step >=0 ? stepStatus[step] : "process" }
                items={[
                    {
                        title: 'Upload Image',
                    },
                    {
                        title: 'Generate Json',
                    },
                    {
                        title: 'Create NFT',
                    },
                ]}
            />
            <UploadBox>
                <Upload
                    accept="image/png, image/jpeg"
                    listType="picture-card"
                    beforeUpload={beforeUpload}
                    customRequest={(option) => onUpload(option)}
                    showUploadList={false}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="avatar"
                            style={{
                                width: '100%',
                            }}
                        />
                    ) : (
                        <div>
                            {loading ? <LoadingOutlined/> : <PlusOutlined/>}
                            <div style={{marginTop: 8}}>Upload</div>
                        </div>
                    )}
                </Upload>
            </UploadBox>
            <FormBox>


            <Form
                labelCol={{span:4}}
                wrapperCol={{span: 20}}
                form={form}
                name="control-hooks"
                onFinish={onFinish}
                >

                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input size="large" />
                </Form.Item>
                <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}>
                    <Input size="large" />
                </Form.Item>
                <Form.Item name="description" label="Description" rules={[{ required: false }]}>
                    <Input  size="large"/>
                </Form.Item>
                <Form.Item name="royalty" label="Royalty" rules={[{ required: false }]}>
                <Input size="large" addonAfter="%"></Input>
            </Form.Item>
                <Col span={20} offset={4}>
                <TextBox>
                    <TextArea  size="large"  rows={4} readOnly={true} value={obj}/>
                </TextBox>
                    <BtmBox>
                        Json Uri: <span>{uri}</span>
                    </BtmBox>
                </Col>

                    <BtnBox>
                        <Button type="primary" htmlType="submit" style={{width:200}} size="large" loading={loading}>Create NFT</Button>
                    </BtnBox>

            </Form>


                <AlertBox>
                    {
                        nftUrl &&
                        <Alert
                            message="NFT Created"
                            description={nftUrl}
                            type="success"
                            showIcon
                        />
                    }
                </AlertBox>


            </FormBox>
        </FlexBox>
    )
}
