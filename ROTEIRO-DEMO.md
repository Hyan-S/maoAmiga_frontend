# Roteiro de demonstração

O roteiro da N2 (até 3 minutos), com a decisão técnica para explicar, está no
[README](README.md#roteiro-de-demonstração-até-3-minutos).

Checklist antes de apresentar:

- [ ] JDK 21 instalado; API rodando (`./mvnw spring-boot:run` no repositório maoAmiga_backend) com a
      pasta `data` apagada
- [ ] IP certo em `src/services/api.ts` (`ipconfig`), celular no mesmo Wi-Fi, ou rodando no
      navegador com `npx expo start --web`
- [ ] Swagger aberto em <http://localhost:8080/swagger-ui.html> para mostrar o 400 e o 404
- [ ] Um id inexistente copiado para o 404: `00000000-0000-0000-0000-000000000000`
