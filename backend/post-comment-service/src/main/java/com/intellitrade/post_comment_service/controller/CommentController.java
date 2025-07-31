package com.intellitrade.post_comment_service.controller;

import com.intellitrade.post_comment_service.dto.request.CommentRequest;
import com.intellitrade.post_comment_service.dto.response.CommentDto;
import com.intellitrade.post_comment_service.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("post-comment/comment")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentDto> addComment(@RequestBody CommentRequest commentRequest) {
        CommentDto savedComment = commentService.saveComment(commentRequest);
        return ResponseEntity.ok(savedComment);
    }
}
