package com.pokemonworld.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 30, message = "El usuario debe tener entre 3 y 30 caracteres")
    @Pattern(
            regexp = "^[a-zA-Z0-9_]+$",
            message = "El usuario solo puede contener letras, numeros y guion bajo"
    )
    private String username;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato valido")
    private String email;

    @NotBlank(message = "La contrasena es obligatoria")
    @Size(min = 8, max = 100, message = "La contrasena debe tener entre 8 y 100 caracteres")
    @Pattern(regexp = ".*[A-Z].*", message = "La contrasena debe contener al menos una letra mayuscula")
    @Pattern(regexp = ".*[a-z].*", message = "La contrasena debe contener al menos una letra minuscula")
    @Pattern(regexp = ".*\\d.*", message = "La contrasena debe contener al menos un numero")
    @Pattern(regexp = "^\\S+$", message = "La contrasena no puede contener espacios")
    private String password;

    @NotBlank(message = "Debes repetir la contrasena")
    private String confirmPassword;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
