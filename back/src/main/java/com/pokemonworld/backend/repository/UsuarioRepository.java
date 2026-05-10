package com.pokemonworld.backend.repository;

import com.pokemonworld.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByTokenConfirmacion(String tokenConfirmacion);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
