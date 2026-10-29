# Cathedra Integra

Estudo, oração e preparação para a confissão. Versão 2.5.0: 85 textos bilíngues, leitura por voz conforme o navegador, biblioteca documental, catequese e exame de consciência com exportação.

## Personagem e fontes — versão 2.5.0

As duas edições compartilham o novo perfil de personagem: voz clerical, confessional, devota e incisiva, sem anunciar a interpretação a cada resposta. A descrição pública continua identificando o personagem como IA. Não afirma ordenação real nem exerce autoridade sacramental. As instruções preservam rigor documental, caridade com pessoas e honestidade quando o usuário pergunta expressamente sobre a identidade do bot.

O modelo recebe 54 fichas de obras anteriores à abertura do Vaticano II, em 11/10/1962. As 11 fichas modernas ou sem data original confirmada deixam de aparecer na biblioteca selecionável e no contexto de IA. Concílios anteriores, inclusive Trento e Vaticano I, são conservados; reimpressões e digitalizações atuais de originais antigos continuam admissíveis. Comentários modernos favoráveis à própria corrente também são excluídos. O catálogo original de 65 fichas é mantido como arquivo histórico do plugin, sem ser reinjetado no prompt.

O bot desta versão não tem ferramenta de pesquisa: a proibição de buscar fontes excluídas é uma regra do perfil, enquanto o filtro de acervo é aplicado pelo código. Não há garantia de que todo modelo externo obedecerá perfeitamente. Em conversas antigas, o perfil atualizado orienta as novas respostas; iniciar uma conversa nova reduz a influência da voz anterior. Mensagens já escritas não são alteradas.

Para atualizar seu repositório, envie os arquivos deste pacote preservando a estrutura; o workflow Pages existente reconstruirá o site. Para atualizar a instalação local, substitua os arquivos do app e preserve .local e seus dados. A alteração é de interface e instruções, portanto não requer reiniciar o servidor: recarregue a página e, se necessário, informe novamente a chave OpenRouter. Não recarregue um exame de consciência não exportado.

## Duas formas de usar

| Edição | Como funciona |
| --- | --- |
| GitHub Pages | Abre no navegador, sem instalar Node. IA com a chave OpenRouter de cada pessoa. |
| Local | Baixe o ZIP, instale Node.js 22 ou superior e abra Iniciar-Cathedra.cmd no Windows, ou siga o LEIA-ME em outros sistemas. Permite ChatGPT e OpenRouter. |

## Publicar no GitHub Pages

1. Envie o conteúdo deste projeto para a raiz do repositório. Preserve as pastas dist, local, tests, scripts e **.github/workflows**, além dos arquivos da raiz. Não envie .local, dados pessoais, chaves ou site/ gerado.
2. No repositório, abra **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Abra **Actions → Publicar Cathedra no GitHub Pages → Run workflow**, escolha main (ou master, conforme seu repositório) e execute. Se Actions estiver desabilitado, habilite-o para este repositório.
4. Espere as etapas build e deploy terminarem. O endereço aparecerá em **Settings → Pages** e na execução concluída.

Novos envios para main ou master publicam novamente. Se sua branch principal tem outro nome, ajuste a lista branches em .github/workflows/pages.yml. O ambiente github-pages pode exigir que você autorize a branch nas regras de implantação do repositório.

O processo testa o projeto, copia apenas dist/ para site/, prepara o modo OpenRouter e publica somente esse resultado. Nenhuma chave de IA é necessária nos Secrets do GitHub. O site funciona também no subcaminho de um repositório, como /cathedra-integra/.

## Usar o site online

Abra **Configurações**, informe sua própria chave OpenRouter e o identificador de um modelo e salve a configuração. Você pode consultar a lista de modelos no próprio app. O uso depende do modelo, saldo e limites da sua conta OpenRouter. A chave fica apenas na memória da aba, sem ser incluída em backups; recarregar exige informá-la novamente.

Orações, biblioteca, leitura dos módulos e exame de consciência não exigem chave. As respostas de IA da catequese e do consultor exigem OpenRouter. Ofícios diários abrem no Divinum Officium/LiveMass em nova aba com a data e as rubricas escolhidas; na edição local, continuam disponíveis dentro do leitor do app.

O login com plano ChatGPT pertence à edição local e não está disponível no Pages. O conteúdo online é público conforme a visibilidade do Pages; o app não acrescenta login de visitantes. Conversas e progresso são salvos no navegador. O exame fica apenas na memória da página, não usa IA e só é salvo quando você o exporta. Dados de localhost e do domínio Pages não se sincronizam; use exportar/importar backup quando desejar transferir conversas e progresso.

## Desenvolvimento

Sem dependências externas de execução. Com Node.js 22 ou superior:

```text
node --test tests/*.test.mjs
node scripts/build-pages.mjs
node server.mjs
```

O último comando inicia a edição local, não a versão Pages. Para testar a versão estática, sirva a pasta site/ por HTTP; não abra index.html diretamente pelo gerenciador de arquivos.

Projeto independente, com persona de IA e orientação doutrinária identificada no aplicativo. Perguntas do exame e traduções editoriais são distinguidas das fórmulas tradicionais e acompanhadas de fontes. Preserve DIVINUM-OFFICIUM-LICENSE.txt e as atribuições dos materiais incluídos. Não se atribui uma licença única a todo o acervo por esta publicação.

Veja LEIA-ME.md para os detalhes da edição local e SANTOS-E-INTENCOES.md para o índice das devoções acrescentadas.
