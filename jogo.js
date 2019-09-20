/*
 *
 * Instituto Federal de Educação, Ciência e Tecnologia - IFPE
 * Curso: Informática para Internet
 * Disciplina: Lógica de Programação e Estrutura de Dados
 * Professor: Allan Lima - allan.lima@igarassu.ifpe.edu.br
 * 
 * Código de Domínio Público, sinta-se livre para usá-lo, modificá-lo e redistribuí-lo.
 *
 */

const express = require('express')
const session = require('express-session')

const app = express()
const port = 3000

app.use(session({ secret: 'XXassasas¨¨$', resave: false, saveUninitialized: true }));

app.set('view engine', 'hbs')
app.set('views', __dirname + '/paginas')

function criarGabarito(req, data) {
	var gabarito = []
	var tabela = data.nivel.tabela
	var acertorRestantes = 0; 

	for (var i = 0; i < tabela.length; i++) {
		gabarito.push(tabela[i].linha[1].dados.slice(0))
		for (var j = 0; j < tabela[i].linha[1].dados.length; j++) {
			if (tabela[i].linha[1].dados[j] == '0') {
				acertorRestantes++
			}

			tabela[i].linha[1].dados[j] = 0
		}
	}

	req.session.acertorRestantes = acertorRestantes;

	return gabarito
}

function inicializarSecao(req) {
	const fs = require('fs');

	var rawdata = fs.readFileSync(__dirname + '/niveis/nivel1.json')
	var data = JSON.parse(rawdata)

	req.session.tabuleiro = data;
	req.session.gabarito = criarGabarito(req, data);
	//console.log("inicializou a sessao");
	//console.log(req.session.gabarito)
}

app.get('/jogar', (req, res) => {
	if (req.session.gabarito == null || req.query.limpar != null) {
		inicializarSecao(req)
	}

	//console.log(req.session.tabuleiro.nivel.tabela[0].linha[1].dados[7])
	res.render('nivel', req.session.tabuleiro)
})

app.get('/tratar', (req, res) => {
	var linha = req.query.linha
	var coluna = req.query.coluna
	var gabarito = req.session.gabarito

	//console.log('gabarito', gabarito[linha][coluna])
	//console.log('json', req.session.tabuleiro.nivel.tabela[linha].linha[1].dados[coluna])
	
	if (gabarito[linha][coluna] == '1') {
		res.sendFile(__dirname + '/paginas/derrota.html')
	} else {
		if (req.session.tabuleiro.nivel.tabela[linha].linha[1].dados[coluna] == 0) {
			req.session.tabuleiro.nivel.tabela[linha].linha[1].dados[coluna] = 1
			req.session.acertorRestantes--
		}
		
		if (req.session.acertorRestantes != 0) {
			res.render('nivel', req.session.tabuleiro)
		} else {
			res.sendFile(__dirname + '/paginas/vitoria.html')
		}
	}

	//console.log('restantes', req.session.acertorRestantes)
})

app.use('/css', express.static(__dirname + '/css'));

app.get('/sobre', (req, res) => { res.sendFile(__dirname + '/paginas/sobre.html')});

app.get('/', (req, res) => { res.sendFile(__dirname + '/paginas/menu.html')});

app.listen(port, () => console.log(`Rodando na porta: ${port}!`))