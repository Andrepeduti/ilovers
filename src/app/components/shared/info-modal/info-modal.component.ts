import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-info-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './info-modal.component.html',
    styleUrl: './info-modal.component.scss'
})
export class InfoModalComponent {
    @Input() type: 'terms' | 'privacy' = 'terms';
    @Output() close = new EventEmitter<void>();

    get title(): string {
        return this.type === 'terms' ? 'Termos de Uso' : 'Política de Privacidade';
    }

    get content(): string {
        if (this.type === 'terms') {
            return `
      <section class="terms-container">
        <h1>Termos de Uso – ILovers</h1>
        <p><strong>Última atualização:</strong> 16/12/2025</p>

        <h2>1. Sobre o aplicativo</h2>
        <p>
          O <strong>ILovers</strong> é um aplicativo independente e privado, destinado
          à interação e relacionamento entre usuários que declaram possuir vínculo
          profissional com a instituição à qual o aplicativo se destina.
        </p>
        <p>
          O ILovers não possui qualquer vínculo, parceria, afiliação ou autorização
          de empresas, instituições financeiras ou empregadores.
        </p>

        <h2>2. Elegibilidade e cadastro</h2>
        <ul>
          <li>Ter no mínimo 18 (dezoito) anos;</li>
          <li>Fornecer informações verdadeiras e atualizadas;</li>
          <li>Concordar com estes Termos de Uso e com a Política de Privacidade.</li>
        </ul>

        <p>
          Durante o cadastro, o usuário poderá informar um identificador profissional
          (“Funcional”).
        </p>

        <h3>2.1 Declaração do usuário</h3>
        <p>
          A informação sobre vínculo profissional é estritamente declaratória e
          fornecida sob exclusiva responsabilidade do usuário.
        </p>
        <p>
          O ILovers não realiza qualquer tipo de validação, verificação ou confirmação
          de vínculo empregatício, institucional ou profissional.
        </p>

        <h2>3. Uso do aplicativo</h2>
        <p>É proibido:</p>
        <ul>
          <li>Fornecer informações falsas ou enganosas;</li>
          <li>Praticar assédio, discriminação ou atividades ilícitas;</li>
          <li>Utilizar o aplicativo para fins comerciais não autorizados;</li>
          <li>Comprometer a segurança da plataforma.</li>
        </ul>

        <h2>4. Isenção de responsabilidade</h2>
        <p>
          O ILovers não garante a veracidade das informações fornecidas pelos usuários
          e não se responsabiliza por interações, encontros ou consequências
          decorrentes do uso do aplicativo.
        </p>

        <h2>5. Planos, pagamentos e benefícios</h2>
        <p>
          O ILovers poderá disponibilizar, no futuro, planos pagos opcionais que
          concederão benefícios adicionais em relação ao plano gratuito.
        </p>

        <h3>5.1 Plano gratuito e período de teste</h3>
        <p>
          O aplicativo poderá oferecer um plano gratuito e um período de teste
          gratuito de <strong>7 (sete) dias</strong> para novos usuários.
        </p>
        <p>
          Após o término do período de teste, o usuário poderá optar por permanecer
          no plano gratuito ou contratar um plano pago.
        </p>

        <h3>5.2 Pagamentos</h3>
        <p>Os pagamentos poderão ser realizados por:</p>
        <ul>
          <li>Pix</li>
          <li>Cartão de crédito</li>
        </ul>
        <p>
          Valores, periodicidade e benefícios serão informados antes da contratação.
        </p>

        <h3>5.3 Cancelamento</h3>
        <p>
            O usuário poderá cancelar o plano pago a qualquer momento, conforme as
            condições informadas no momento da contratação.
        </p>

        <h2>6. Propriedade intelectual</h2>
        <p>
            Todo o conteúdo do aplicativo é protegido por direitos de propriedade
            intelectual.
        </p>

        <h2>7. Alterações dos Termos</h2>
        <p>
            O ILovers poderá alterar estes Termos a qualquer momento. O uso contínuo do
            aplicativo implica concordância com as alterações.
        </p>

        <h2>8. Foro e legislação aplicável</h2>
        <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil.
        </p>
      </section>
      `;
        } else {
            return `
      <section class="privacy-container">
        <h1>Política de Privacidade – ILovers</h1>
        <p>
          O ILovers respeita a privacidade dos usuários e atua em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).
        </p>

        <h2>1. Dados coletados</h2>
        <p>O ILovers poderá coletar os seguintes dados pessoais:</p>
        <ul>
          <li>Nome ou apelido informado pelo usuário;</li>
          <li>Endereço de e-mail;</li>
          <li>Senha (armazenada de forma criptografada);</li>
          <li>Informações de perfil fornecidas voluntariamente;</li>
          <li>Identificador profissional (“Funcional”), quando informado;</li>
          <li>Declaração de vínculo profissional.</li>
        </ul>
        <p>O fornecimento do identificador profissional é opcional e não é verificado pelo aplicativo.</p>

        <h2>2. Finalidade do uso dos dados</h2>
        <p>Os dados coletados são utilizados para:</p>
        <ul>
          <li>Criar e gerenciar contas de usuário;</li>
          <li>Permitir a utilização das funcionalidades do aplicativo;</li>
          <li>Garantir segurança e prevenção de fraudes;</li>
          <li>Comunicação com o usuário;</li>
          <li>Cumprimento de obrigações legais.</li>
        </ul>

        <h2>3. Base legal</h2>
        <p>O tratamento dos dados pessoais ocorre com base:</p>
        <ul>
          <li>No consentimento do titular;</li>
          <li>Na execução do contrato representado por estes Termos de Uso;</li>
          <li>No legítimo interesse, quando aplicável.</li>
        </ul>

        <h2>4. Compartilhamento de dados</h2>
        <p>O ILovers não compartilha dados pessoais com empresas, instituições financeiras, empregadores ou terceiros, exceto:</p>
        <ul>
          <li>Quando exigido por lei ou ordem judicial;</li>
          <li>Para provedores de serviços essenciais ao funcionamento do aplicativo, sob contrato de confidencialidade.</li>
        </ul>

        <h2>5. Segurança da informação</h2>
        <p>
          O ILovers adota medidas técnicas e organizacionais razoáveis para proteger os dados pessoais contra acessos não autorizados, perda, alteração ou divulgação indevida.
        </p>

        <h2>6. Direitos do titular</h2>
        <p>O usuário pode, a qualquer momento:</p>
        <ul>
          <li>Solicitar acesso aos seus dados;</li>
          <li>Solicitar correção ou atualização;</li>
          <li>Solicitar exclusão da conta e dos dados pessoais;</li>
          <li>Revogar consentimentos concedidos.</li>
        </ul>
        <p>As solicitações podem ser feitas por meio do canal de contato disponibilizado no aplicativo.</p>

        <h2>7. Retenção e exclusão</h2>
        <p>
          Os dados pessoais serão mantidos apenas pelo tempo necessário para cumprir as finalidades descritas nesta Política ou obrigações legais. Após isso, serão excluídos ou anonimizados.
        </p>

        <h2>8. Alterações da Política de Privacidade</h2>
        <p>Esta Política poderá ser atualizada periodicamente. A versão mais recente estará sempre disponível no aplicativo.</p>

        <h2>9. Contato</h2>
        <p>Em caso de dúvidas sobre estes Termos ou sobre a Política de Privacidade, o usuário poderá entrar em contato pelo canal informado no aplicativo.</p>
      </section>
      `;
        }
    }

    onClose() {
        this.close.emit();
    }
}
