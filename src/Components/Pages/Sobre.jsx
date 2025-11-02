import { useState, useEffect } from "react";
import styles from "./Sobre.module.css";
import rankingStyles from "./Ranking.module.css";

import hiloCover from "../../assets/hilo-cover.jpg";
import blackjackCover from "../../assets/blackjack-cover.png";
import FichaAzul from "../../assets/Ficha_azul.png";
import FichaLaranja from "../../assets/Ficha_laranja.png";
import backCard from "../../assets/backCard.png";
import cores from "../../assets/Cores.png";

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
        <h2 className={styles.sobreTabTitle}>
          Filosofia de Design do CardNest
        </h2>

        {/* Nova seção para a imagem da paleta de cores */}
        <div style={{ textAlign: "center", margin: "2rem 0" }}>
          <img
            src={cores} // Imagem da paleta de cores
            alt="Paleta de Cores do CardNest"
            style={{
              width: "100%",
              maxWidth: "200px",
              height: "auto",
              marginBottom: "1rem",
            }}
          />
        </div>

        {/* Esta é a linha principal que organiza o texto e as imagens */}
        <div className={styles.sobreDesignRow}>
          {/* Coluna de Texto: Justificativa da paleta de cores */}
          <div className={styles.sobreDesignText}>
            <p style={{ textAlign: "justify" }}>
              A concepção visual do CardNest foi redefinida para harmonizar a
              elegância clássica dos jogos de cartas com a funcionalidade e a
              estética "Dark Mode" de uma aplicação web moderna.
            </p>
            <p style={{ textAlign: "justify", marginTop: "1rem" }}>
              A paleta de cores, exibida acima, foi o pilar dessa mudança,
              abandonando o tradicional verde para criar uma hierarquia visual
              clara:
            </p>

            {/* Lista de cores para justificar para a banca */}
            <ul
              style={{
                paddingLeft: "20px",
                marginTop: "1rem",
                textAlign: "left",
              }}
            >
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>
                  Tons de Azul (<code>#1B263B</code>, <code>#3A506B</code>):
                </strong>
                Estabelecem o tom sofisticado e calmo, criando profundidade e
                direcionando o foco do usuário para o conteúdo.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <strong>
                  Off-White (<code>#F0F0F0</code>):
                </strong>
                Usado para textos principais, garante legibilidade máxima e um
                contraste limpo contra o fundo escuro, essencial para uma
                experiência sem fadiga visual.
              </li>
              <li>
                <strong>
                  Laranja de Ação (<code>#FF7F00</code>):
                </strong>
                Empregado estrategicamente como cor de destaque. Sua vivacidade
                (vista nas fichas) serve para chamar a atenção para ações
                cruciais, como botões e notificações, guiando a interação.
              </li>
            </ul>
          </div>

          {/* Coluna de Imagens: Usando os assets importados */}
          <div className={styles.sobreDesignImgs}>
            <img
              src={FichaAzul} // Variável importada
              alt="Ficha de Jogo Azul"
              style={{
                width: "100%",
                maxWidth: "120px",
                height: "auto",
                marginBottom: "1rem",
                borderRadius: "50%", // Fichas são redondas
              }}
            />
            <img
              src={FichaLaranja} // Variável importada
              alt="Ficha de Jogo Laranja"
              style={{
                width: "100%",
                maxWidth: "120px",
                height: "auto",
                marginBottom: "1rem",
                borderRadius: "50%", // Fichas são redondas
              }}
            />
            <img
              src={backCard} // Variável importada
              alt="Verso da Carta Personalizado"
              style={{
                width: "100%",
                maxWidth: "120px",
                height: "auto",
                borderRadius: "8px", // Cartas são retangulares
              }}
            />
          </div>
        </div>

        {/* Texto de conclusão, usando a classe de parágrafo padrão */}
        <div
          className={styles.sobreTabText}
          style={{ textAlign: "justify", marginTop: "1.2rem" }}
        >
          <p>
            Elementos como o logo minimalista, os ícones de naipes incorporados
            sutilmente no fundo e o design detalhado de fichas e versos de
            cartas (como os apresentados ao lado) foram desenvolvidos para
            reforçar a identidade do CardNest como um verdadeiro "ninho" para os
            amantes de cartas, onde a tradição encontra a inovação.
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
            vantagem de 3 fichas e encostar a sua bandeja na base da balança
            vence a partida!
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

        {/* --- SEÇÃO DO LED CORRIGIDA --- */}
        <div className={styles.sobreHiloSectionSubtitle}>
          A Personalidade da Mesa (O LED)
        </div>
        <div className={styles.sobreHiloText}>
          A Mesa muda de estratégia a cada nova rodada! O LED indica a{" "}
          <strong>estratégia</strong> da Mesa, mas o limite exato é um mistério
          para manter o jogo imprevisível:
        </div>
        <ul className={styles.sobreHiloList} style={{ marginTop: "1em" }}>
          <li>
            <strong>LED Verde (Cautelosa):</strong> A Mesa vai parar de pedir
            cartas ao atingir <strong>14 ou 15 pontos</strong>.
          </li>
          <li>
            <strong>LED Amarelo (Padrão):</strong> A Mesa vai parar ao atingir{" "}
            <strong>16, 17 ou 18 pontos</strong>.
          </li>
          <li>
            <strong>LED Vermelho (Agressiva):</strong> A Mesa vai arriscar mais
            e só parar ao atingir <strong>19 ou 20 pontos</strong>.
          </li>
        </ul>

        {/* --- SEÇÃO DE PONTUAÇÃO CORRIGIDA --- */}
        <div className={styles.sobreHiloSectionSubtitle}>
          Pontuação e Fim da Partida
        </div>
        <ul className={styles.sobreHiloList}>
          <li>
            <strong>A Balança:</strong> Vencer uma rodada adiciona uma ficha ao
            seu prato. Perder uma rodada adiciona uma ficha ao prato da Mesa.
          </li>
          <li>
            <strong>Empate:</strong> Se a rodada empatar,{" "}
            <strong>ambos os lados ganham uma ficha!</strong>
          </li>
          <li>
            <strong>Vitória na Partida:</strong> A partida termina
            instantaneamente quando um dos lados conseguir uma{" "}
            <strong>vantagem de 3 fichas</strong> (ex: 3-0, 4-1, 5-2).
          </li>
          <li>
            <strong>Pontuação Final (Ranking):</strong> Sua pontuação{" "}
            <strong>nunca é zero!</strong> No final da partida,{" "}
            <strong>metade das fichas do perdedor</strong> (arredondado para
            baixo) são transferidas para o vencedor.
          </li>
          <li>
            <strong>Se você Vencer:</strong> Sua pontuação é o seu total de
            fichas + a metade que você recebeu da Mesa.
          </li>
          <li>
            <strong>Se você Perder:</strong> Sua pontuação é a metade de fichas
            que <strong>restaram</strong> com você.
          </li>
          <li>
            <strong>Exemplo:</strong> Você vence por <strong>8-6</strong>.
            Metade das 6 fichas da Mesa (3) vêm para você. Sua pontuação final:{" "}
            <strong>11</strong> (8+3). Se você perdesse por <strong>8-6</strong>
            , perderia 4 das suas 8 fichas, mas ainda pontuaria{" "}
            <strong>4</strong>!
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
            na plataforma e em seus jogos..
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
