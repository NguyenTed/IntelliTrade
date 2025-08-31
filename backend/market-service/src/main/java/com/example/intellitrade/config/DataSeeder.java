package com.example.intellitrade.config;

import com.example.intellitrade.model.Symbol;
import com.example.intellitrade.repository.SymbolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(SymbolRepository symbolRepository) {
        return args -> {
            if (symbolRepository.count() == 0) {
                List<Symbol> symbols = Arrays.asList(
                        new Symbol(null, "BTCUSDT", "Bitcoin / TetherUS",
                                Arrays.asList("https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg", "https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC.svg")),
                        new Symbol(null, "ETHUSDT", "Ethereum / TetherUS",
                                Arrays.asList("https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg", "https://s3-symbol-logo.tradingview.com/crypto/XTVCETH.svg")),
                        new Symbol(null, "SOLUSDT", "SOL / TetherUS",
                                Arrays.asList("https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg", "https://s3-symbol-logo.tradingview.com/crypto/XTVCSOL.svg")),
                        new Symbol(null, "XRPUSDT", "XRP / TetherUS",
                                Arrays.asList("https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg", "https://s3-symbol-logo.tradingview.com/crypto/XTVCXRP.svg")),
                        new Symbol(null, "BTCUSD", "Bitcoin / US Dollar",
                                List.of("https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC.svg")),
                        new Symbol(null, "ETHUSD", "Ethereum / US Dollar",
                                List.of("https://s3-symbol-logo.tradingview.com/crypto/XTVCETH.svg")),
                        new Symbol(null, "DOGEUSDT", "Dogecoin / TetherUS",
                                Arrays.asList("https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg", "https://s3-symbol-logo.tradingview.com/crypto/XTVCDOGE.svg")),
                        new Symbol(null, "ADAUSDT", "Cardano / TetherUS",
                                Arrays.asList("https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg", "https://s3-symbol-logo.tradingview.com/crypto/XTVCADA.svg")),
                        new Symbol(null, "LINKUSDT", "ChainLink / TetherUS",
                                Arrays.asList("https://s3-symbol-logo.tradingview.com/crypto/XTVCUSDT.svg", "https://s3-symbol-logo.tradingview.com/crypto/XTVCLINK.svg")),
                        new Symbol(null, "ETHBTC", "Ethereum / Bitcoin",
                                Arrays.asList("https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC.svg", "https://s3-symbol-logo.tradingview.com/crypto/XTVCETH.svg"))

                );
                symbolRepository.saveAll(symbols);
                System.out.println("✅ Seeded sample symbols into MongoDB");
            }
        };
    }
}
