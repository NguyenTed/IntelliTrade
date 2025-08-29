package com.example.intellitrade.repository;

import com.example.intellitrade.model.Symbol;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SymbolRepository extends MongoRepository<Symbol, String> {
}
