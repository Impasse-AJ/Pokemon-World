package com.pokemonworld.backend.service;

import com.pokemonworld.backend.dto.LoginRequest;
import com.pokemonworld.backend.dto.RegisterRequest;
import com.pokemonworld.backend.dto.RegisterResponse;
import com.pokemonworld.backend.dto.UsuarioResponse;
import com.pokemonworld.backend.entity.Usuario;
import com.pokemonworld.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public RegisterResponse registrar(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Las contrasenas no coinciden");
        }

        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Ya existe un usuario registrado con ese email");
        }

        if (usuarioRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Ya existe un usuario con ese nombre de usuario");
        }

        String passwordHasheada = passwordEncoder.encode(request.getPassword());
        String token = UUID.randomUUID().toString();

        Usuario usuario = new Usuario(username, email, passwordHasheada);
        usuario.setActivo(false);
        usuario.setTokenConfirmacion(token);
        usuario.setFechaExpiracionToken(LocalDateTime.now().plusHours(24));

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        String urlConfirmacionDev = backendUrl + "/api/auth/confirm?token=" + token;

        return new RegisterResponse(
                "Registro completado. Revisa tu bandeja de entrada para activar tu cuenta.",
                UsuarioResponse.desdeUsuario(usuarioGuardado),
                urlConfirmacionDev
        );
    }

    public Usuario login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales incorrectas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new IllegalArgumentException("Credenciales incorrectas");
        }

        if (!usuario.isActivo()) {
            throw new IllegalStateException("Debes confirmar tu cuenta antes de iniciar sesion");
        }

        return usuario;
    }

    public UsuarioResponse confirmarCuenta(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token de confirmacion no valido");
        }

        Usuario usuario = usuarioRepository.findByTokenConfirmacion(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de confirmacion no valido"));

        if (usuario.isActivo()) {
            return UsuarioResponse.desdeUsuario(usuario);
        }

        if (usuario.getFechaExpiracionToken() == null
                || usuario.getFechaExpiracionToken().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El token de confirmacion ha expirado");
        }

        usuario.setActivo(true);
        usuario.setTokenConfirmacion(null);
        usuario.setFechaExpiracionToken(null);

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        return UsuarioResponse.desdeUsuario(usuarioGuardado);
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }
}
