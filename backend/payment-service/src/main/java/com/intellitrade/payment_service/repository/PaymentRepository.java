package com.intellitrade.payment_service.repository;

import com.intellitrade.payment_service.data.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment,String> {

}
