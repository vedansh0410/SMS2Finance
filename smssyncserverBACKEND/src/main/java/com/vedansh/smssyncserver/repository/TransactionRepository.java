package com.vedansh.smssyncserver.repository;

import com.vedansh.smssyncserver.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {

    Optional<TransactionEntity> findByRrn(String rrn);

    List<TransactionEntity> findAllByOrderByPaymentDateDesc();

    List<TransactionEntity> findByTransactionType(String transactionType);

    List<TransactionEntity> findByBankName(String bankName);

    List<TransactionEntity> findByAccountLastFourOrderByPaymentDateDesc(String accountLastFour);

    boolean existsByRrn(String rrn);

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM TransactionEntity t WHERE t.transactionType = 'DEBIT'")
    Double getTotalDebitAmount();

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM TransactionEntity t WHERE t.transactionType = 'CREDIT'")
    Double getTotalCreditAmount();

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM TransactionEntity t WHERE t.transactionType = 'DEBIT' AND t.accountLastFour = :account")
    Double getTotalDebitAmountByAccount(@Param("account") String account);

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM TransactionEntity t WHERE t.transactionType = 'CREDIT' AND t.accountLastFour = :account")
    Double getTotalCreditAmountByAccount(@Param("account") String account);

    long countByAccountLastFour(String accountLastFour);

    @Query("SELECT DISTINCT t.accountLastFour FROM TransactionEntity t WHERE t.accountLastFour IS NOT NULL")
    List<String> findDistinctAccountLastFour();

    @Query("SELECT t.merchant, COUNT(t), SUM(t.amount) FROM TransactionEntity t WHERE t.merchant IS NOT NULL GROUP BY t.merchant ORDER BY SUM(t.amount) DESC")
    List<Object[]> getTopMerchants();

    @Query("SELECT t.bankName, COUNT(t), SUM(t.amount) FROM TransactionEntity t WHERE t.bankName IS NOT NULL GROUP BY t.bankName ORDER BY COUNT(t) DESC")
    List<Object[]> getBankDistribution();
}
