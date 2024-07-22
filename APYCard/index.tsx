
import {
  useErrorHandler,
  withErrorBoundary
} from 'react-error-boundary';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import clsx from 'clsx';
import { useQuery } from 'react-query';

import ErrorFallback from 'components/ErrorFallback';
import { CHAIN_IDS } from 'config/web3/chains';
import formatNumberWithFixedDecimals from 'utils/helpers/format-number-with-fixed-decimals';
import formatNumberWithComma from 'utils/helpers/format-number-with-comma';
import xIMXDataFetcher, {
  XIMXData,
  X_IMX_DATA_FETCHER
} from 'services/fetchers/x-imx-data-fetcher';
import reservesDistributorDataFetcher, {
  ReservesDistributorData,
  RESERVES_DISTRIBUTOR_DATA_FETCHER
} from 'services/fetchers/reserves-distributor-data-fetcher';

const Term = ({
  className,
  ...rest
}: React.ComponentPropsWithRef<'dt'>) => (
  <dt
    className={clsx(
      'text-base',
      'font-medium',
      className
    )}
    {...rest} />
);
const Description = ({
  className,
  ...rest
}: React.ComponentPropsWithRef<'dd'>) => (
  <dd
    className={clsx(
      'text-xl',
      'font-bold',
      className
    )}
    {...rest} />
);

const APYCard = ({
  className,
  ...rest
}: React.ComponentPropsWithRef<'dl'>): JSX.Element => {
  const {
    chainId = CHAIN_IDS.ETHEREUM_MAIN_NET
  } = useWeb3React<Web3Provider>();

  const {
    isLoading: xIMXDataLoading,
    data: xIMXData,
    error: xIMXDataError
  } = useQuery<XIMXData, Error>(
    [
      X_IMX_DATA_FETCHER,
      chainId
    ],
    xIMXDataFetcher,
    {
      enabled: chainId !== undefined,
      refetchInterval: 10000
    }
  );
  useErrorHandler(xIMXDataError);

  const {
    isLoading: reservesDistributorDataLoading,
    data: reservesDistributorData,
    error: reservesDistributorDataError
  } = useQuery<ReservesDistributorData, Error>(
    [
      RESERVES_DISTRIBUTOR_DATA_FETCHER,
      chainId
    ],
    reservesDistributorDataFetcher,
    {
      enabled: chainId !== undefined,
      refetchInterval: 10000
    }
  );
  useErrorHandler(reservesDistributorDataError);

  let stakingAPYLabel: string | number = '-';
  let totalIMXStakedLabel: string | number = '-';
  let totalIMXDistributedLabel: string | number = '-';
  if (xIMXDataLoading) {
    stakingAPYLabel = 'Loading...';
    totalIMXStakedLabel = 'Loading...';
  } else {
    if (xIMXData === undefined) {
      throw new Error('Something went wrong!');
    }

    const xIMXAPY = Math.pow(1 + parseFloat(xIMXData.dailyAPR), 365) - 1;
    stakingAPYLabel = formatNumberWithFixedDecimals(2)(xIMXAPY * 100);
    stakingAPYLabel = formatNumberWithComma(stakingAPYLabel);
    stakingAPYLabel = `${stakingAPYLabel} %`;

    totalIMXStakedLabel = formatNumberWithFixedDecimals(2)(Number(xIMXData.totalBalance));
    totalIMXStakedLabel = formatNumberWithComma(totalIMXStakedLabel);
  }

  if (reservesDistributorDataLoading) {
    totalIMXDistributedLabel = 'Loading...';
  } else {
    if (reservesDistributorData === undefined) {
      throw new Error('Something went wrong!');
    }

    totalIMXDistributedLabel = formatNumberWithFixedDecimals(2)(Number(reservesDistributorData.distributed));
    totalIMXDistributedLabel = formatNumberWithComma(totalIMXDistributedLabel);
  }

  return (
    <dl
      className={clsx(
        'shadow',
        'overflow-hidden',
        'md:rounded',
        'px-6',
        'py-4',
        'bg-impermaxJade-200',
        className
      )}
      {...rest}>
      <Term>
        Staking APY
      </Term>
      <Description className='text-3xl'>
        {stakingAPYLabel}
      </Description>
      <Term className='mt-2'>
        Total IMX Staked
      </Term>
      <Description>
        {totalIMXStakedLabel}
      </Description>
      <Term className='mt-2'>
        Total IMX Distributed
      </Term>
      <Description>
        {totalIMXDistributedLabel}
      </Description>
    </dl>
  );
};

export default withErrorBoundary(APYCard, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});
