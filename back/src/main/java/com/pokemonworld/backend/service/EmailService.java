package com.pokemonworld.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Value("${app.mail.from-name}")
    private String mailFromName;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmailActivacion(String emailDestino, String username, String urlActivacion) {
        if (!mailEnabled) {
            return;
        }

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, false, "UTF-8");

            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(emailDestino);
            helper.setSubject("Activa tu cuenta en Pokemon World Map");
            helper.setText(crearTextoActivacion(username, urlActivacion), false);

            mailSender.send(mensaje);
        } catch (MailException | MessagingException | UnsupportedEncodingException error) {
            throw new IllegalStateException("No se pudo enviar el email de activacion");
        }
    }

    private String crearTextoActivacion(String username, String urlActivacion) {
        return """
                Hola %s,

                Gracias por registrarte en Pokemon World Map.

                Para activar tu cuenta, pulsa en el siguiente enlace:

                %s

                Si no has creado esta cuenta, puedes ignorar este correo.

                Pokemon World Map
                """.formatted(username, urlActivacion);
    }
}
