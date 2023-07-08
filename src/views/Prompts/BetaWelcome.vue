<template>
  <div class="landing-page">
    <h1>Bem vindas e bem vindos ao Beta da plataforma Sessão Zero!</h1>

    <section>
      <p>
        Antes de mais nada, é importante vocês saberem que este site está sendo
        implementado por <b>colegas universitários</b>, assim como você, em seu
        tempo livre.
      </p>

      <p>
        Por isso, é possível que se deparem com algum bug. Se isso acontecer,
        por favor <b>não deixem de relatar</b>, seja no grupo da turma, ou numa
        funcionalidade que jajá será implementada só para isso.
      </p>
    </section>

    <section>
      <h2>Criar conta</h2>

      <p>
        Basta inventar e inserir o apelido que voce utilizará para fazer logins
        no futuro no campo de apelido.
      </p>
    </section>

    <section>
      <h2>Quero ser jogador</h2>

      <p>
        Se você veio aqui apenas para jogar, basta criar uma conta rápida,
        escolher uma das aventuras disponíveis e se inscrever.
      </p>
    </section>

    <section>
      <h2>Quero ser narrador</h2>

      <p>
        Para narrar, basta criar sua conta e em seguida clicar no botão da tela
        para <b>criar uma nova aventura</b>.
      </p>
    </section>

    <button @click="$router.push({ name: 'home' })">
      <span class="material-symbols-rounded"> send </span>
      Continuar
    </button>
  </div>
</template>

<style lang="scss" scoped>
.landing-page {
  flex-direction: column;
  gap: 2rem;

  padding: 1.5rem;

  white-space: pre-line;

  text-align: justify;

  b {
    color: var(--tx-gray-darker);
  }

  h1 {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--tx-gray-darker);
    text-align: center;
  }

  h2 {
    font-size: 1.2rem;
    color: var(--tx-main);
  }

  section {
    flex-direction: column;
    gap: 0.5rem;
  }

  p {
    display: inline;
  }

  button {
    align-self: center;
  }

  @media (min-width: 768px) {
    padding-inline: 20%;

    button {
      align-self: unset;
    }
  }
}
</style>
