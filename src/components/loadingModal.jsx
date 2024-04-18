import React from 'react';
import styled from 'styled-components';
import Loading from './loading';

const Mask = styled.div`
  background: rgba(0, 0, 0, 0.4);
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  .btn {
    margin-right: 20px;
  }
`;
const Box = styled.div`
  width: 300px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  color: #fff;
`;
export default function LoadingModal({ text }) {
  return (
    <Mask>
      <Box>
        <Loading />
        {text && <p>{text}</p>}
      </Box>
    </Mask>
  );
}
