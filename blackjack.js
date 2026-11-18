// Blackjack: jogador contra a máquina
class Blackjack extends JS_CG_2D_API {
  acaoAoIniciar() {
    this.saldo = 100;
    this.aposta = 50;
    this.tempoJogada = 15;
    this.tempo = 15;
    this.acao = "";
    this.estado = "apostando";
    this.jogador = [];
    this.maquina = [];
    this.mensagem = "Escolha a aposta e clique em Jogar.";
    this.carregarImagens();
    this.criarBotoes();
  }

  carregarImagens() {
    this.fundo = new Image();
    this.fundo.src = "imagens/mesa.png";
    this.cartas = [];
    const naipes = ["hearts", "diamonds", "clubs", "spades"]; //imagens de https://kenney.nl/assets/playing-cards-pack
    const valores = [
      "A",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "J",
      "Q",
      "K",
    ];

    for (let n = 0; n < 4; n++) {
      for (let v = 0; v < 13; v++) {
        let imagem = new Image();
        imagem.src =
          "imagens/" +
          naipes[n] +
          "/card_" +
          naipes[n] +
          "_" +
          valores[v] +
          ".png";
        this.cartas.push(imagem);
      }
    }

    this.verso = new Image();
    this.verso.src = "imagens/card_back.png";
  }

  criarBotoes() {
    this.criarBotaoTouch("menos", 30, 510, 120, 50, "- R$10");
    this.criarBotaoTouch("mais", 170, 510, 120, 50, "+ R$10");
    this.criarBotaoTouch("jogar", 310, 510, 160, 50, "Jogar");
    this.criarBotaoTouch("comprar", 490, 510, 160, 50, "Comprar");
    this.criarBotaoTouch("parar", 670, 510, 160, 50, "Parar");
  }

  criarBaralho() {
    this.baralho = [];
    for (let i = 0; i < 52; i++) {
      this.baralho.push(i);
    }
  }

  darCarta(mao) {
    let posicao = Math.floor(Math.random() * this.baralho.length); //puxa uma carta
    let carta = this.baralho.splice(posicao, 1)[0]; //remove a carta do baralho
    mao.push(carta);
  }

  pontos(mao) {
    let total = 0;
    let ases = 0;
    for (let i = 0; i < mao.length; i++) {
      let valor = mao[i] % 13;
      if (valor == 0) {
        total += 11;
        ases++;
      } else if (valor >= 9) {
        total += 10;
      } else {
        total += valor + 1;
      }
    }
    while (total > 21 && ases > 0) {
      total -= 10;
      ases--;
    } // An Ace may be played as a one or an 11. regra que se passar de 21 o ás vale 1
    return total;
  }

  cliqueDoMouse(e) {
    if (this.getBotaoTouch("menos").foiClicado(e)) this.acao = "menos";
    if (this.getBotaoTouch("mais").foiClicado(e)) this.acao = "mais";
    if (this.getBotaoTouch("jogar").foiClicado(e)) this.acao = "jogar";
    if (this.getBotaoTouch("comprar").foiClicado(e)) this.acao = "comprar";
    if (this.getBotaoTouch("parar").foiClicado(e)) this.acao = "parar";
  }

  atualizar(dt) {
    if (this.estado == "apostando") {
      if (this.acao == "menos" && this.aposta > 10) {
        this.aposta -= 10;
      }
      if (this.acao == "mais") {
        this.aposta = Math.min(this.saldo, this.aposta + 10);
      }
      if (this.acao == "jogar" && this.aposta <= this.saldo) {
        this.saldo -= this.aposta;
        this.criarBaralho();
        this.jogador = [];
        this.maquina = [];
        this.darCarta(this.jogador);
        this.darCarta(this.maquina);
        this.darCarta(this.jogador);
        this.darCarta(this.maquina);
        this.tempo = this.tempoJogada;
        this.mensagem = "Sua vez: comprar ou parar?";
        this.estado = "jogador";
        if (
          this.pontos(this.jogador) == 21 ||
          this.pontos(this.maquina) == 21
        ) {
          this.estado = "calculando";
        }
      }
    } else if (this.estado == "jogador") {
      this.tempo -= dt;
      if (this.tempo <= 0 || this.acao == "parar") {
        this.estado = "maquina";
      } else if (this.acao == "comprar") {
        this.darCarta(this.jogador);
        this.tempo = this.tempoJogada;
        if (this.pontos(this.jogador) > 21) {
          this.estado = "calculando";
        } else if (this.pontos(this.jogador) == 21) {
          this.estado = "maquina";
        }
      }
    } else if (this.estado == "maquina") {
      while (this.pontos(this.maquina) < 17) {
        this.darCarta(this.maquina);
      }
      this.estado = "calculando";
    } else if (this.estado == "calculando") {
      let jogador = this.pontos(this.jogador);
      let maquina = this.pontos(this.maquina);
      let blackjackJogador = jogador == 21 && this.jogador.length == 2;
      let blackjackMaquina = maquina == 21 && this.maquina.length == 2;
      if (jogador > 21) {
        this.mensagem = "Você estourou!";
      } else if (blackjackJogador && blackjackMaquina) {
        this.mensagem = "Empate!";
        this.saldo += this.aposta;
      } else if (blackjackJogador) {
        this.mensagem = "Blackjack! Você ganhou!";
        this.saldo += this.aposta * 2;
      } else if (blackjackMaquina) {
        this.mensagem = "Blackjack da máquina!";
      } else if (maquina > 21 || jogador > maquina) {
        this.mensagem = "Você ganhou!";
        this.saldo += this.aposta * 2;
      } else if (jogador == maquina) {
        this.mensagem = "Empate!";
        this.saldo += this.aposta;
      } else {
        this.mensagem = "A máquina ganhou!";
      }
      this.mensagem += " Clique em Jogar para continuar.";
      if (this.saldo < 10) {
        this.mensagem = "Sem dinheiro! Clique em Jogar para reiniciar.";
      }
      this.estado = "resultado";
    } else if (this.estado == "resultado") {
      if (this.acao == "jogar") {
        if (this.saldo < 10) this.saldo = 100;
        this.aposta = Math.min(this.aposta, this.saldo);
        this.jogador = [];
        this.maquina = [];
        this.mensagem = "Escolha a aposta e clique em Jogar.";
        this.estado = "apostando";
      }
    }
    this.acao = "";
  }

  escrever(texto, x, y) {
    this.preenchimento("white");
    this.texto(texto, x, y, 22);
  }

  desenharMao(mao, y, esconder) {
    let espaco = 90;
    for (let i = 0; i < mao.length; i++) {
      let imagem = this.cartas[mao[i]];
      if (esconder && i === 1) imagem = this.verso;
      this.imagem(imagem, 30 + i * espaco, y, 80, 116);
    }
  }

  desenhar() {
    this.limparTela("#145a32");
    this.imagem(this.fundo, 0, 0, 900, 600);
    this.escrever("Saldo: R$ " + this.saldo, 30, 35);
    this.escrever("Aposta: R$ " + this.aposta, 330, 35);

    if (this.estado == "jogador") {
      let tempo = Math.ceil(Math.max(0, this.tempo));
      this.escrever("Tempo: " + tempo + "s", 650, 35);
      let primeira = this.maquina[0] % 13;
      let pontos = primeira == 0 ? 11 : Math.min(primeira + 1, 10);
      this.escrever("Máquina: " + pontos + " + ?", 30, 90);
    } else {
      this.escrever("Máquina: " + this.pontos(this.maquina), 30, 90);
    }

    this.imagem(this.verso, 800, 110, 80, 116);
    this.desenharMao(this.maquina, 110, this.estado == "jogador");
    this.escrever("Você: " + this.pontos(this.jogador), 30, 280);
    this.desenharMao(this.jogador, 300, false);
    this.escrever(this.mensagem, 30, 470);
  }
}

window.addEventListener("load", () => {
  new Blackjack("Blackjack", "gameCanvas", 900, 600);
});
