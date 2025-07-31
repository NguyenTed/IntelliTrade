package com.intellitrade.post_comment_service.service;

import com.intellitrade.post_comment_service.dto.request.CommentRequest;
import com.intellitrade.post_comment_service.dto.response.CommentDto;
import com.intellitrade.post_comment_service.feign.CrawlerInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    @Autowired
    CrawlerInterface crawlerInterface;

    public CommentDto saveComment(CommentRequest request) {
        return crawlerInterface.saveComment(request);
    }
}
