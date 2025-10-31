import { useState, useEffect } from "react";
import styles from "./Sobre.module.css";
import rankingStyles from "./Ranking.module.css";

import hiloCover from "../../assets/hilo-cover.jpg";
import blackjackCover from "../../assets/blackjack-cover.jpg";

const tabs = [
  {
    key: "ideia",
    label: "Ideia",
    content: (
      <>
        <h2 className={styles.sobreTabTitle}>Sobre a Plataforma</h2>
        <p className={styles.sobreTabText}>
          A concepção do projeto CardNest partiu de um objetivo inicial
          específico: o desenvolvimento de um jogo de Blackjack como Trabalho de
          Conclusão de Curso. Contudo, durante o processo, o escopo da ideia foi
          ampliado ao se perceber o potencial de criar não apenas um jogo, mas
          todo o ecossistema ao redor dele.
        </p>
        <p className={styles.sobreTabText}>
          O projeto então evoluiu. O foco foi redefinido para a criação de uma
          plataforma web robusta, projetada para hospedar uma variedade de jogos
          de cartas. Para enriquecer a experiência, foram integradas
          funcionalidades de comunidade, como perfis de usuário, histórico de
          partidas e um sistema de ranking global para fomentar a competição
          amigável.
        </p>
        <p className={styles.sobreTabText}>
          O resultado é a plataforma que você vê hoje. O nome "CardNest" reflete
          essa missão de ser um "ninho" agregador para entusiastas de jogos de
          cartas. O sistema foi lançado com dois jogos iniciais, mas sua
          arquitetura foi planejada desde o início com a escalabilidade em
          mente, pronta para crescer e incorporar novos desafios no futuro.
        </p>
      </>
    ),
  },
  {
    key: "design",
    label: "Design",
    content: (
      <>
        <h2 className={styles.sobreTabTitle}>Escolhas de Design</h2>
        <div className={styles.sobreDesignRow}>
          <div className={styles.sobreDesignImgs}>
            <img
              src={"/Logo%20Principal.svg"}
              alt="Logo Principal"
              style={{
                maxHeight: 80,
                background: "#fff",
                borderRadius: 8,
                padding: 4,
              }}
            />
            <img
              src={"/Logo%20ambiente.svg"}
              alt="Logo Ambiente"
              style={{
                maxHeight: 80,
                background: "#fff",
                borderRadius: 8,
                padding: 4,
              }}
            />
          </div>
          <div className={styles.sobreDesignText}>
            <p>
              O visual do CardNest foi pensado com uma ideia em mente: misturar
              o charme dos jogos de cartas clássicos com a fluidez de um site
              moderno e fácil de usar.
            </p>
          </div>
        </div>
        <div
          className={styles.sobreTabText}
          style={{ textAlign: "justify", marginTop: "1.2rem" }}
        >
          <p>
            Por isso, escolhemos uma paleta de cores mais sóbria, como o
            cinza-escuro e o verde tradicional da mesa de jogo, para criar um
            clima focado e elegante. As fontes também seguem essa linha, com uma
            super legível para garantir que tudo funcione bem, e outra mais
            estilosa para dar personalidade ao nosso baralho personalizado.
          </p>
          <p>
            Desde o logo minimalista até cada detalhe das cartas, tudo foi
            criado com carinho para que você sinta que está em um lugar especial
            para jogar — um verdadeiro &#39;ninho&#39; para os amantes de
            cartas, que combina o melhor do tradicional com a praticidade da
            web.
          </p>
        </div>
      </>
    ),
  },
  {
    key: "hilo",
    label: "HiLo",
    content: (
      <div className={styles.sobreHiloContent}>
        <h2 className={styles.sobreHiloSectionTitle}>Como Jogar: Hi-Lo</h2>
        <div className={styles.sobreHiloHeroRow}>
          <img
            src={hiloCover}
            alt="Hi-Lo Game CardNest"
            className={styles.sobreHiloHeroImage}
          />
          <div className={styles.sobreHiloText}>
            Seu objetivo no Hi-Lo é conseguir a maior sequência de acertos
            consecutivos possível. Adivinhe se a próxima carta será mais alta ou
            mais baixa que a atual. Um único erro zera sua sequência!
          </div>
        </div>
        <div className={styles.sobreHiloSectionSubtitle}>As Regras</div>
        <ul className={styles.sobreHiloList}>
          <li>
            Clique em &quot;Começar Jogo&quot; para receber sua primeira carta
            de referência.
          </li>
          <li>
            Olhe para a carta na mesa e faça seu palpite: a próxima carta do
            baralho será ALTA ou BAIXA?
          </li>
          <li>
            Clique no botão correspondente. Mas seja rápido, você tem um tempo
            limitado para cada jogada!
          </li>
        </ul>
        <div className={styles.sobreHiloDica}>
          Ordem das Cartas: O 2 é a carta mais baixa e o Ás é a mais alta.
        </div>
        <div className={styles.sobreHiloSectionSubtitle}>Pontuação</div>
        <ul className={styles.sobreHiloList}>
          <li>
            <b>Sequência:</b> Mostra seus acertos consecutivos no momento.
          </li>
          <li>
            <b>Recorde:</b> Guarda a sua maior sequência de acertos nesta
            partida. Seu objetivo é sempre superar este número!
          </li>
        </ul>
        <div className={styles.sobreHiloSectionSubtitle}>Dicas Rápidas</div>
        <ul className={styles.sobreHiloList}>
          <li>O baralho tem cartas únicas. Fique de olho nas que já saíram!</li>
          <li>
            O contador de cartas restantes na tela é seu maior aliado
            estratégico.
          </li>
        </ul>
        <div className={styles.sobreHiloSectionSubtitle}>Fim da Partida</div>
        <div className={styles.sobreHiloText}>
          A partida termina quando as cartas do baralho acabam. Sua pontuação
          final, que será registrada no ranking, é o seu Recorde da partida.
        </div>
        <div className={styles.sobreHiloDica}>Boa sorte!</div>
      </div>
    ),
  },
  {
    key: "blackjack",
    label: "BlackJack",
    content: (
      <div className={styles.sobreHiloContent}>
        <h2 className={styles.sobreHiloSectionTitle}>
          Como Jogar: BlackJack do Nest
        </h2>
        <div className={styles.sobreHiloHeroRow}>
          <img
            src={blackjackCover} // << IMAGEM QUE VOCÊ IMPORTOU
            alt="BlackJack Game CardNest"
            className={styles.sobreHiloHeroImage}
          />
          <div className={styles.sobreHiloText}>
            Seu objetivo é levar a balança ao seu favor! Em cada rodada, tente
            chegar mais perto de 21 pontos do que a Mesa, sem estourar. Vencer
            rodadas adiciona fichas à balança, e o primeiro a conseguir uma
            vantagem de 3 fichas vence a partida!
          </div>
        </div>
        <div className={styles.sobreHiloSectionSubtitle}>
          As Regras da Rodada
        </div>
        <ul className={styles.sobreHiloList}>
          <li>
            O jogo é disputado em turnos. Na "Sua Vez", você tem duas opções:
          </li>
          <li>
            <strong>Pedir (clique no baralho):</strong> Recebe mais uma carta.
            Cuidado para não passar de 21!
          </li>
          <li>
            <strong>Parar:</strong> Encerra sua vez na rodada, mantendo sua mão
            atual.
          </li>
          <li>
            A Mesa (computador) então joga a vez dela, decidindo entre "Pedir" e
            "Parar" com base na sua "personalidade" da rodada.
          </li>
          <li>
            A rodada termina quando ambos ("Você" e "Mesa") decidem Parar, ou
            quando alguém "Estoura" (passa de 21).
          </li>
        </ul>
        <div className={styles.sobreHiloDica}>
          Valores das Cartas: 2-10 valem o número da face. Valete (J), Dama (Q)
          e Rei (K) valem 10. O Ás (A) vale 11 ou 1 (o que for melhor para sua
          mão).
        </div>
        <div className={styles.sobreHiloSectionSubtitle}>
          A Personalidade da Mesa (O LED)
        </div>
        <div className={styles.sobreHiloText}>
          A Mesa muda de estratégia a cada nova rodada! Fique de olho no LED
          para saber como ela vai se comportar:
        </div>
        <ul className={styles.sobreHiloList} style={{ marginTop: "1em" }}>
          <li>
            <strong>LED Verde (Cautelosa):</strong> A Mesa vai parar de pedir
            cartas ao atingir <strong>15 pontos</strong> ou mais.
          </li>
          <li>
            <strong>LED Amarelo (Padrão):</strong> A Mesa vai parar ao atingir{" "}
            <strong>17 pontos</strong> ou mais.
          </li>
          <li>
            <strong>LED Vermelho (Agressiva):</strong> A Mesa vai arriscar mais
            e só parar ao atingir <strong>19 pontos</strong> ou mais.
          </li>
        </ul>
        <div className={styles.sobreHiloSectionSubtitle}>
          Pontuação e Fim da Partida
        </div>
        <ul className={styles.sobreHiloList}>
          <li>
            <strong>A Balança:</strong> Vencer uma rodada adiciona uma ficha ao
            seu prato. Perder uma rodada adiciona uma ficha ao prato da Mesa.
          </li>
          <li>
            <strong>Vitória na Partida:</strong> A partida termina
            instantaneamente quando um dos lados conseguir uma{" "}
            <strong>vantagem de 3 fichas</strong> (ex: 3-0, 4-1, 5-2).
          </li>
          <li>
            <strong>Pontuação Final (Ranking):</strong> Sua pontuação registrada
            no ranking é o <strong>número total de fichas na balança</strong> no
            momento em que a partida acaba. Se você vencer por 5-2, sua
            pontuação será 7!
          </li>
        </ul>
        <div className={styles.sobreHiloDica}>Boa sorte, e quebre a banca!</div>
      </div>
    ),
  },
  {
    key: "futuro",
    label: "Ideias Futuras",
    content: (
      <div
        className={styles.sobreFuturoContent + " " + styles.sobreTabsContent}
      >
        <h2 className={styles.sobreTabTitle}>Próximas Fases do Projeto</h2>
        <p className={styles.sobreTabText}>
          O CardNest foi concebido como um projeto em constante desenvolvimento.
          A versão atual representa a base sólida sobre a qual novas
          experiências serão construídas. Os próximos passos planejados visam
          enriquecer a plataforma em três áreas principais:
        </p>
        <div className={styles.sobreFuturoSection}>
          <h3 className={styles.sobreFuturoSubtitle}>
            Desenvolvimento do Blackjack
          </h3>
          <p className={styles.sobreTabText}>
            O próximo passo no desenvolvimento será a introdução do jogo que
            originalmente inspirou o projeto: uma versão própria e customizada
            do Blackjack. Esta adição não só cumprirá a visão conceitual inicial
            do trabalho, como também trará uma experiência de jogo mais complexa
            e estratégica para a plataforma.
          </p>
        </div>
        <div className={styles.sobreFuturoSection}>
          <h3 className={styles.sobreFuturoSubtitle}>
            Criação de um Espaço Comunitário
          </h3>
          <p className={styles.sobreTabText}>
            Será desenvolvida uma seção dedicada à &quot;comunidade&quot;, que
            funcionará como fóruns, para que os próprios jogadores possam
            interagir. O objetivo é criar um ambiente para a troca de ideias e
            estratégias, permitindo que o diálogo sobre o projeto aconteça de
            forma orgânica entre os membros, para além do canal de suporte
            técnico.
          </p>
        </div>
        <div className={styles.sobreFuturoSection}>
          <h3 className={styles.sobreFuturoSubtitle}>
            Comunicação e Transparência no Desenvolvimento
          </h3>
          <p className={styles.sobreTabText}>
            Para manter a comunidade informada sobre a evolução do projeto, a
            seção &quot;Atualizações&quot; funcionará como um diário de
            desenvolvimento. Neste espaço, serão publicadas de forma regular as
            notas sobre todas as novidades, melhorias e correções implementadas
            na plataforma e em seus jogos.
          </p>
        </div>
      </div>
    ),
  },
];

const Sobre = () => {
  const [activeTab, setActiveTab] = useState("ideia");

  // Controla o overflow da página para evitar scroll desnecessário
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      const originalOverflow = root.style.overflow;
      root.style.overflow = "hidden";

      return () => {
        root.style.overflow = originalOverflow;
      };
    }
  }, []);

  return (
    <div
      className={`${rankingStyles.project_container} ${styles.sobrePageContainer}`}
    >
      <div className={rankingStyles.grand_title_container}>
        <h1 className={rankingStyles.grand_title}>Sobre</h1>
      </div>
      <div className={styles.sobreTabsBg}>
        <div className={styles.sobreTabsGrid}>
          {/* Menu lateral de abas */}
          <nav className={styles.sobreTabsMenu} aria-label="Sobre">
            <ul>
              {tabs.map((tab) => (
                <li key={tab.key}>
                  <button
                    className={
                      activeTab === tab.key
                        ? styles.sobreTabButtonActive
                        : styles.sobreTabButton
                    }
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {/* Conteúdo da aba */}
          <section className={styles.sobreTabsContent}>
            {tabs.find((tab) => tab.key === activeTab)?.content}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Sobre;
