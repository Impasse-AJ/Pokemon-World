package com.pokemonworld.backend.dto;

public class RegisterResponse {

    private String mensaje;
    private UsuarioResponse usuario;
    private String urlConfirmacionDev;

    public RegisterResponse(String mensaje, UsuarioResponse usuario, String urlConfirmacionDev) {
        this.mensaje = mensaje;
        this.usuario = usuario;
        this.urlConfirmacionDev = urlConfirmacionDev;
    }

    public String getMensaje() {
        return mensaje;
    }

    public UsuarioResponse getUsuario() {
        return usuario;
    }

    public String getUrlConfirmacionDev() {
        return urlConfirmacionDev;
    }
}
