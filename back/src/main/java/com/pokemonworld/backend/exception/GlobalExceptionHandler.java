package com.pokemonworld.backend.exception;

import com.pokemonworld.backend.dto.ValidacionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidacionResponse> manejarErroresValidacion(
            MethodArgumentNotValidException error
    ) {
        Map<String, String> errores = new LinkedHashMap<>();

        error.getBindingResult().getFieldErrors().forEach(campoError ->
                errores.putIfAbsent(campoError.getField(), campoError.getDefaultMessage())
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ValidacionResponse("Revisa los campos del formulario", errores));
    }
}
