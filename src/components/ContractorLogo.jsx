import React from 'react';
import S3Avatar from './S3Avatar';

const ContractorLogo = ({ 
  logoKey, 
  contractorName, 
  size = 40, 
  sx = {} 
}) => {
  return (
    <S3Avatar
      s3Key={logoKey}
      alt={contractorName}
      sx={{ width: size, height: size, ...sx }}
    >
      {contractorName?.charAt(0)?.toUpperCase()}
    </S3Avatar>
  );
};

export default ContractorLogo; 