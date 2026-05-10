package com.pokemonworld.backend.service;

import com.pokemonworld.backend.dto.LoginRequest;
import com.pokemonworld.backend.dto.RegisterRequest;
import com.pokemonworld.backend.dto.UsuarioResponse;
import com.pokemonworld.backend.entity.Usuario;
import com.pokemonworld.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioResponse registrar(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Las contrasenas no coinciden");
        }

        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }

        if (usuarioRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Ya existe un usuario con ese nombre");
        }

        String passwordHasheada = passwordEncoder.encode(request.getPassword());

        Usuario usuario = new Usuario(username, email, passwordHasheada);
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        return UsuarioResponse.desdeUsuario(usuarioGuardado);
    }

    public Usuario login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales incorrectas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new IllegalArgumentException("Credenciales incorrectas");
        }

        return usuario;
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }
}
