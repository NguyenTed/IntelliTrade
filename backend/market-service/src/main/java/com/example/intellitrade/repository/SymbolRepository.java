package com.example.intellitrade.repository;

import com.example.intellitrade.model.Symbol;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SymbolRepository extends MongoRepository<Symbol, String> {
}
