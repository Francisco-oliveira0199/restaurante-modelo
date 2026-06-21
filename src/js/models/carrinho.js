export class Carrinho {
  constructor() {
    this.itens = JSON.parse(localStorage.getItem("carrinho")) || [];
  }

  salvar() {
    localStorage.setItem("carrinho", JSON.stringify(this.itens));
  }

  gerarChave(item) {
    return JSON.stringify({
      nome: item.nome,
      sabor1: item.sabor1,
      sabor2: item.sabor2,
      meioMeio: item.meioMeio,
      borda: item.borda,
      bebida: item.bebida,
      ponto: item.ponto,
      massa: item.massa,
      extras: (item.extras || []).slice().sort()
    });
  }

  adicionar(item) {
    const chave = this.gerarChave(item);

    const existente = this.itens.find(i => this.gerarChave(i) === chave);

    if (existente) {
      existente.quantidade += item.quantidade;
      existente.total += item.total;
    } else {
      this.itens.push(item);
    }

    this.salvar();
  }

  aumentar(index) {
    const item = this.itens[index];
    item.quantidade++;
    item.total = item.precoUnitario * item.quantidade;
    this.salvar();
  }

  diminuir(index) {
    const item = this.itens[index];

    if (item.quantidade > 1) {
      item.quantidade--;
      item.total = item.precoUnitario * item.quantidade;
    } else {
      this.remover(index);
      return;
    }

    this.salvar();
  }

  remover(index) {
    this.itens.splice(index, 1);
    this.salvar();
  }

  limpar() {
    this.itens = [];
    this.salvar();
  }

  getItens() {
    return this.itens;
  }

  getTotal() {
    return this.itens.reduce((t, i) => t + i.total, 0);
  }
}