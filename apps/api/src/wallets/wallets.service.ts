import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

@Injectable()
export class WalletsService {
  constructor(private readonly db: DatabaseService) {}

  async getWallet(userId: string) {
    let wallet = await this.db.client.wallet.findUnique({
      where: { userId },
      include: { ledger: { take: 10, orderBy: { createdAt: 'desc' } } },
    });

    if (!wallet) {
      wallet = await this.db.client.wallet.create({
        data: { userId },
        include: { ledger: true },
      });
    }

    return wallet;
  }

  async addTransaction(userId: string, amount: number, type: TransactionType, description: string) {
    const wallet = await this.getWallet(userId);

    if (type === TransactionType.DEBIT && wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const newBalance = type === TransactionType.CREDIT 
      ? wallet.balance + amount 
      : wallet.balance - amount;

    return this.db.client.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      return tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          description,
        },
      });
    });
  }

  async requestWithdrawal(userId: string, amount: number, accountInfo: string) {
    const wallet = await this.getWallet(userId);
    
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance for withdrawal');
    }

    const fee = amount * 0.025; // 2.5% Razorpay/Service fee
    const netAmount = amount - fee;

    return this.db.client.$transaction(async (tx) => {
      // Deduct from wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance - amount },
      });

      // Create ledger entry
      await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount,
          description: `Withdrawal request for ₹${amount} (Fee: ₹${fee})`,
        },
      });

      // Create withdrawal request
      return tx.withdrawalRequest.create({
        data: {
          walletId: wallet.id,
          amount,
          fee,
          netAmount,
          accountInfo,
          status: 'PENDING',
        },
      });
    });
  }

  async getMyWithdrawals(userId: string) {
    const wallet = await this.getWallet(userId);
    return this.db.client.withdrawalRequest.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
