package com.intellitrade.post_comment_service.controller;

import com.intellitrade.post_comment_service.dto.response.ArticleDto;
import com.intellitrade.post_comment_service.dto.request.PageRequestDto;
import com.intellitrade.post_comment_service.dto.response.PageResponseDto;
import com.intellitrade.post_comment_service.service.PostCommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("post-comment")
public class PostCommentController {
    @Autowired
    PostCommentService postCommentService;

    @GetMapping("tradingview")
    public ResponseEntity<PageResponseDto<ArticleDto>> getTradingViewArticles(@Valid PageRequestDto pageRequestDto) {
        PageResponseDto<ArticleDto> articles = postCommentService.getTradingViewArticles(pageRequestDto);
        if (articles.getContent().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else return new ResponseEntity<>(articles, HttpStatus.OK);
    }

    @GetMapping("vnexpress")
    public ResponseEntity<PageResponseDto<ArticleDto>> getVnExpressArticles(@Valid PageRequestDto pageRequestDto) {
        PageResponseDto<ArticleDto> articles = postCommentService.getVnExpressArticles(pageRequestDto);
        if (articles.getContent().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else return new ResponseEntity<>(articles, HttpStatus.OK);
    }
}
