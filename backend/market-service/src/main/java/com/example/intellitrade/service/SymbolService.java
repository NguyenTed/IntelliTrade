package com.example.intellitrade.service;

import com.example.intellitrade.dto.request.PageRequestDto;
import com.example.intellitrade.dto.response.PageResponseDto;
import com.example.intellitrade.model.Symbol;
import com.example.intellitrade.repository.SymbolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
public class SymbolService {

    @Autowired
    private SymbolRepository symbolRepository;

    public PageResponseDto<Symbol> getSymbols(PageRequestDto pageRequestDto) {
        Sort sort = Sort.by(
                pageRequestDto.getSortDirection().equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                pageRequestDto.getSortBy()
        );

        Pageable pageable = PageRequest.of(pageRequestDto.getPage(), pageRequestDto.getSize(), sort);
        Page<Symbol> page = symbolRepository.findAll(pageable);

        return new PageResponseDto<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
    }
}
