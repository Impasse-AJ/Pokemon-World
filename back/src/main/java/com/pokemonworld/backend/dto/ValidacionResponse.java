package com.pokemonworld.backend.dto;

import java.util.Map;

public class ValidacionResponse {

    private final String mensaje;
    private final Map<String, String> errores;

    public ValidacionResponse(String mensaje, Map<String, String> errores) {
        this.mensaje = mensaje;
        this.errores = errores;
    }

    public String getMensaje() {
        return mensaje;
    }

    public Map<String, String> getErrores() {
        return errores;
    }
}
