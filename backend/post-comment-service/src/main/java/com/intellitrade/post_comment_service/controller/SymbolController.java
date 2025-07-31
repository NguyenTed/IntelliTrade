package com.intellitrade.post_comment_service.controller;

import com.intellitrade.post_comment_service.dto.response.SymbolDto;
import com.intellitrade.post_comment_service.dto.response.TagDto;
import com.intellitrade.post_comment_service.service.SymbolService;
import com.intellitrade.post_comment_service.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("post-comment/symbol")
public class SymbolController {
    @Autowired
    private SymbolService symbolService;

    @GetMapping("search")
    public ResponseEntity<List<SymbolDto>> getSymbolsByKeyword(@RequestParam String keyword) {
        List<SymbolDto> symbols = symbolService.getSymbolsByKeyword(keyword);
        if (symbols.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        else return new ResponseEntity<>(symbols, HttpStatus.OK);
    }
}
