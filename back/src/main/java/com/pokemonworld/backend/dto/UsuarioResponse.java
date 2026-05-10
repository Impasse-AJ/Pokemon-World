package com.pokemonworld.backend.dto;

import com.pokemonworld.backend.entity.Usuario;

import java.time.LocalDateTime;

public class UsuarioResponse {

    private Long id;
    private String username;
    private String email;
    private LocalDateTime fechaCreacion;

    public UsuarioResponse(Long id, String username, String email, LocalDateTime fechaCreacion) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fechaCreacion = fechaCreacion;
    }

    public static UsuarioResponse desdeUsuario(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getFechaCreacion()
        );
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}
