package com.pokemonworld.backend.controller;

import com.pokemonworld.backend.dto.LoginRequest;
import com.pokemonworld.backend.dto.MensajeResponse;
import com.pokemonworld.backend.dto.RegisterRequest;
import com.pokemonworld.backend.dto.RegisterResponse;
import com.pokemonworld.backend.dto.UsuarioResponse;
import com.pokemonworld.backend.entity.Usuario;
import com.pokemonworld.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String CLAVE_USUARIO_SESION = "USUARIO_ID";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            RegisterResponse respuesta = authService.registrar(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(new MensajeResponse(error.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            Usuario usuario = authService.login(request);

            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(CLAVE_USUARIO_SESION, usuario.getId());

            return ResponseEntity.ok(UsuarioResponse.desdeUsuario(usuario));
        } catch (IllegalStateException error) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MensajeResponse(error.getMessage()));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MensajeResponse(error.getMessage()));
        }
    }

    @GetMapping("/confirm")
    public ResponseEntity<?> confirmarCuenta(@RequestParam String token) {
        try {
            UsuarioResponse usuario = authService.confirmarCuenta(token);
            return ResponseEntity.ok(new RegisterResponse(
                    "Cuenta confirmada correctamente. Ya puedes iniciar sesion.",
                    usuario,
                    null
            ));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(new MensajeResponse(error.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute(CLAVE_USUARIO_SESION) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MensajeResponse("No hay sesion activa"));
        }

        Long usuarioId = (Long) session.getAttribute(CLAVE_USUARIO_SESION);

        try {
            Usuario usuario = authService.buscarPorId(usuarioId);
            return ResponseEntity.ok(UsuarioResponse.desdeUsuario(usuario));
        } catch (IllegalArgumentException error) {
            session.invalidate();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MensajeResponse("Sesion no valida"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<MensajeResponse> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(new MensajeResponse("Sesion cerrada correctamente"));
    }
}
