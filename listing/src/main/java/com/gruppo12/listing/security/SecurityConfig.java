package com.gruppo12.listing.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/search-results.html",
                                "/card-page.html",
                                "/init-token.html",
                                "/*.js",
                                "/*.css",
                                "/*.html",
                                "/static/**"
                        ).permitAll()

                        .requestMatchers(HttpMethod.GET,"/listings").permitAll()
                        .requestMatchers(HttpMethod.GET,"/listings/card/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/listings/search").permitAll()
                        .requestMatchers(HttpMethod.POST,"/listings").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}