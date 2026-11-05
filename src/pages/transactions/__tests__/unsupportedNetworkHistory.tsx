import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { WalletTrxHistoryRow } from '@components/WalletTrxHistory';
import { HistoryItemType } from '@types';

import { mockUnitTransactionTransfer } from '../../../../__tests__/mocks/mockTransactions';
import BulkTransaction from '../components/BulkTransaction';
import UnitTransaction from '../components/UnitTransaction';

describe.each(['unit', 'bulk', 'wallet'])('%s history row', (row) => {
  test.each([1, 11155111, 43114, 999999])(
    'preserves transactions on chain %s with optional explorer links',
    (chainId) => {
      const transaction = {
        ...mockUnitTransactionTransfer,
        network: { chainId },
        itemType: row === 'bulk' ? HistoryItemType.BULK : HistoryItemType.UNIT,
      };

      render(
        row === 'unit' ? (
          <UnitTransaction transaction={transaction} account="0x123" />
        ) : row === 'bulk' ? (
          <BulkTransaction transaction={transaction} account="0x123" index={0} />
        ) : (
          <WalletTrxHistoryRow trxHistoryItem={transaction} connectedAccount="0x123" />
        ),
      );

      const transactionText = screen.getByText(/Transferred\s+379\.0006\s+ETH/);
      expect(transactionText).toBeVisible();
      if (row === 'bulk') {
        expect(screen.getByText('Bulk Transaction')).toBeVisible();
      }

      if (chainId === 1) {
        expect(screen.queryByRole('link')).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
      }
    },
  );
});
