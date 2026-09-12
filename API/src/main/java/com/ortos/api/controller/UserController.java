package com.ortos.api.controller;

import com.ortos.api.dto.UserDto;
import com.ortos.api.dto.UserSaveRequest;
import com.ortos.api.security.AccessGuard;
import com.ortos.api.security.AuthenticatedUser;
import com.ortos.api.security.CurrentUser;
import com.ortos.api.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserDto> findAll() {
        AccessGuard.requireAdmin(CurrentUser.get());
        return userService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto create(@RequestBody UserSaveRequest req) {
        AuthenticatedUser actor = CurrentUser.get();
        AccessGuard.requireAdmin(actor);
        return userService.create(req, actor);
    }

    @PutMapping("/{id}")
    public UserDto update(@PathVariable String id, @RequestBody UserSaveRequest req) {
        AuthenticatedUser actor = CurrentUser.get();
        AccessGuard.requireAdmin(actor);
        return userService.update(id, req, actor);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        AuthenticatedUser actor = CurrentUser.get();
        AccessGuard.requireAdmin(actor);
        userService.delete(id, actor);
    }
}
