import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Api from "@/infra/helpers/api"
import { Endereco } from "@/types/Endereco"
import { Usuario } from "@/types/Usuario"
import { PenIcon, PlusIcon, TrashIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Perfil() {
    const [activeTab, setActiveTab] = useState("general")
    const [usuario, setUsuario] = useState<Usuario>();
    const [listaEnderecos, setListaEnderecos] = useState<Endereco[]>();
    const [expandirDadosEndereco, setExpandirDadosEndereco] = useState(false);
    const [expandirCadastroEndereco, setExpandirCadastroEndereco] = useState(false);
    const [nomeEndereco, setNomeEndereco] = useState("");
    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [complemento, setComplemento] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [enderecoSelecionado, setEnderecoSelecionado] = useState<Endereco>();
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [email, setEmail] = useState("");
    const [cpfcnpjFormatado, setCpfCnpjFormatado] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [sobrenome, setSobrenome] = useState("");

    useEffect(() => {
        recuperarUsuarioLogado();
    }, [])

    const formatarTelefone = (event: React.ChangeEvent<HTMLInputElement>) => {
        const telefone = event.target.value;
        let telefoneFormatado = telefone.replace(/\D/g, "");
        if (telefoneFormatado.length <= 11) {
            telefoneFormatado = telefoneFormatado.replace(
                /^(\d{2})(\d{5})(\d{4})$/,
                "($1) $2-$3"
            );
        } else if (telefoneFormatado.length <= 10) {
            telefoneFormatado = telefoneFormatado.replace(
                /^(\d{2})(\d{4})(\d{4})$/,
                "($1) $2-$3"
            );
        }
        setTelefone(telefoneFormatado);
    };

    const formatarCfpCnpj = (event: React.ChangeEvent<HTMLInputElement>, cpfcnpj? : any) => {
        let { value } = cpfcnpj ? { value: cpfcnpj } : event.target;
        value = value.replace(/\D/g, '');

        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else if (value.length > 11 && value.length <= 14) {
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            value = value.slice(0, 14);
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        }

        setCpfCnpjFormatado(value);
    };

    const recuperarUsuarioLogado = async () => {
        const usuarioJson = localStorage.getItem("UsuarioLogado");
        if (usuarioJson) {
            setUsuario(JSON.parse(usuarioJson));
            setListaEnderecos(JSON.parse(usuarioJson).enderecos);
            setNome(JSON.parse(usuarioJson).nome);
            setSobrenome(JSON.parse(usuarioJson).sobrenome);
            setEmail(JSON.parse(usuarioJson).email);
            setSenha(JSON.parse(usuarioJson).senha);
            setDataNascimento(JSON.parse(usuarioJson).dataNascimento);
            setTelefone(JSON.parse(usuarioJson).telefone);
            formatarCfpCnpj('' as any, JSON.parse(usuarioJson).cpfcnpj);
        }
    }

    useEffect(() => {
        if (enderecoSelecionado) {
            setNomeEndereco(enderecoSelecionado.nome);
            setCep(enderecoSelecionado.cep);
            setRua(enderecoSelecionado.rua);
            setNumero(enderecoSelecionado.numero);
            setComplemento(enderecoSelecionado.complemento);
            setBairro(enderecoSelecionado.bairro);
            setCidade(enderecoSelecionado.cidade);
            setEstado(enderecoSelecionado.estado);
        }
    }, [enderecoSelecionado])

    const editarEndereco = async () => {
        if (!nomeEndereco || !cep || !rua || !numero || !bairro || !cidade || !estado) {
            toast.error("Preencha todos os campos obrigatórios!");
            return;
        }

        const endereco = {
            nome: nomeEndereco,
            cep,
            rua,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            usuario
        }

        toast.promise(Api.put(`endereco/editar/${enderecoSelecionado?.id}`, endereco).then(() => {
            atualizarUsuario();
            toast.success("Endereço cadastrado com sucesso!");
        }).catch(() => {
            toast.error("Erro ao recuperar usuario após cadastrar o endereco");
        }), {
            loading: "Salvando...",
        });
    }

    const atualizarUsuario = async () => {
        const dto = {
            email: usuario?.email,
            senha: usuario?.senha
        }

        const { data } = await Api.post("usuario/entrar", dto);
        const UsuarioLogado = JSON.stringify(data);
        localStorage.setItem("UsuarioLogado", UsuarioLogado);
        recuperarUsuarioLogado();
        limparDadosEndereco();
        setExpandirDadosEndereco(false);
    }

    const limparDadosEndereco = () => {
        setNomeEndereco("");
        setCep("");
        setRua("");
        setNumero("");
        setComplemento("");
        setBairro("");
        setCidade("");
        setEstado("");
    }

    const salvarAlteracoes = async () => {


        const dto = {
            id: usuario?.id,
            nome,
            sobrenome,
            email,
            senha,
            dataNascimento,
            cpfcnpj: cpfcnpjFormatado,
            telefone,
            enderecos: listaEnderecos
        }

        toast.promise(Api.put(`usuario/editar/${usuario?.id}`, dto).then(() => {
            localStorage.setItem("UsuarioLogado", JSON.stringify(dto));
            toast.success("Dados cadastrais atualizados com sucesso!");
            atualizarUsuario();
            window.location.href = "/";
        }).catch(() => {
            return toast.error("Erro ao atualizar dados cadastrais");
        }), {
            loading: "Salvando...",
        });
    }

    const deletarEndereco = async () => {
        toast.promise(Api.delete(`endereco/deletar/${enderecoSelecionado?.id}`).then(() => {
            atualizarUsuario();
            toast.success("Endereço deletado com sucesso!");
        }).catch(() => {
            toast.error("Erro ao deletar endereço");
        }), {
            loading: "Deletando...",
        });
    }

    const cadastroEndereco = (param : boolean) => {
        setNomeEndereco("");
        setCep("");
        setRua("");
        setNumero("");
        setComplemento("");
        setBairro("");
        setCidade("");
        setEstado("");
        setExpandirCadastroEndereco(param);
    }

    const edicaoEndereco = (param : boolean) => {
        if (!nomeEndereco || !cep || !rua || !numero || !bairro || !cidade || !estado) {
            toast.error("Selecione um endereço para editar!");
            return;
        }
        setExpandirDadosEndereco(param);
    }

    const cadastrarEndereco = async () => {
        if (!nomeEndereco || !cep || !rua || !numero || !bairro || !cidade || !estado) {
            toast.error("Preencha todos os campos obrigatórios!");
            return;
        }

        const endereco = {
            nome: nomeEndereco,
            cep,
            rua,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            usuario
        }

        toast.promise(Api.post("endereco/cadastrar", endereco).then(() => {
            atualizarUsuario();
            toast.success("Endereço cadastrado com sucesso!");
            cadastroEndereco(false);
        }).catch(() => {
            toast.error("Erro ao recuperar usuario após cadastrar o endereco");
        }), {
            loading: "Salvando...",
        });
    }

    return (
        <Card className="w-full max-w-lg mt-[10rem]">
            <CardHeader>
                <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">Geral</TabsTrigger>
                        <TabsTrigger value="address">Endereço</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general">
                        <div className="flex flex-col items-center gap-6">
                            <div className="rounded-full bg-muted p-1 mt-5">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>JP</AvatarFallback>
                                </Avatar>
                            </div>
                            <CardContent className="grid gap-6">
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="nome">Nome</Label>
                                            <Input value={nome} id="nome" placeholder="José" required onChange={(e) => setNome(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="sobrenome">Sobrenome</Label>
                                            <Input value={sobrenome} id="sobrenome" placeholder="Silva" required onChange={(e) => setSobrenome(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input value={email} id="email" placeholder="jose.silva@mintecommerce.com.br" required type="email" onChange={(e) => setEmail(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="senha">Senha</Label>
                                            <Input value={senha} id="senha" required type="password" onChange={(e) => setSenha(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="data-nascimento">Data de Nascimento</Label>
                                            <Input value={dataNascimento} id="data-nascimento" placeholder="dd/mm/aaaa" required type="date" onChange={(e) => setDataNascimento(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="cpf">CPF/CNPJ</Label>
                                            <Input id="cpf" placeholder="000.000.000-00" required onChange={formatarCfpCnpj} value={cpfcnpjFormatado} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="telefone">Telefone</Label>
                                            <Input value={telefone} id="telefone" placeholder="(00) 00000-0000" required onChange={formatarTelefone} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </TabsContent>
                    <TabsContent value="address">
                        <CardContent className="flex flex-col justify-center">
                            <div className="flex gap-6 mt-5">
                                <div className="flex max-w-[14.3rem] justify-center">
                                    <Select onValueChange={(value) => setEnderecoSelecionado(JSON.parse(value))}>
                                        <SelectTrigger className="flex w-[14.3rem]">
                                            <SelectValue className="flex w-full" placeholder="Selecione um endereço" />
                                        </SelectTrigger>
                                        <SelectContent className="cursor-pointer">
                                            {listaEnderecos?.map((endereco) => (
                                                <SelectItem key={endereco.id} value={JSON.stringify(endereco)}>
                                                    {endereco.nome} - {endereco.rua}, {endereco.numero} - {endereco.bairro}, {endereco.cidade} - {endereco.estado}, {endereco.cep}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant={"outline"} onClick={() => cadastroEndereco(true)}><PlusIcon className="w-4 h-4"/></Button>
                                    <Button variant={"outline"} onClick={() => edicaoEndereco(true)} >
                                        <PenIcon className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={deletarEndereco} variant={"destructive"}>
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            {expandirDadosEndereco && <div className="border p-5 rounded-lg mt-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nome">Nome</Label>
                                        <Input value={nomeEndereco} id="nome" placeholder="Casa, trabalho..." required onChange={(e) => setNomeEndereco(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cep">CEP</Label>
                                        <Input value={cep} id="cep" placeholder="00000-000" required onChange={(e) => setCep(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="rua">Rua</Label>
                                        <Input value={rua} id="rua" placeholder="Rua" required onChange={(e) => setRua(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="numero">Número</Label>
                                        <Input value={numero} id="numero" placeholder="Número" required onChange={(e) => setNumero(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="complemento">Complemento</Label>
                                        <Input value={complemento} id="complemento" placeholder="Apartamento, Casa, etc." onChange={(e) => setComplemento(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bairro">Bairro</Label>
                                        <Input value={bairro} id="bairro" placeholder="Seu bairro" required onChange={(e) => setBairro(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cidade">Cidade</Label>
                                        <Input value={cidade} id="cidade" placeholder="Sua cidade" required onChange={(e) => setCidade(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="estado">Estado</Label>
                                        <Input value={estado} id="estado" placeholder="Seu estado" required onChange={(e) => setEstado(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-3 gap-3">
                                    <Button variant={"outline"} onClick={() => edicaoEndereco(false)}>Cancelar</Button>
                                    <Button onClick={() => editarEndereco()}><PlusIcon /></Button>
                                </div>
                            </div>}
                            {expandirCadastroEndereco && <div className="border p-5 rounded-lg mt-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nome">Nome</Label>
                                        <Input value={nomeEndereco} id="nome" placeholder="Casa, trabalho..." required onChange={(e) => setNomeEndereco(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cep">CEP</Label>
                                        <Input value={cep} id="cep" placeholder="00000-000" required onChange={(e) => setCep(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="rua">Rua</Label>
                                        <Input value={rua} id="rua" placeholder="Rua" required onChange={(e) => setRua(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="numero">Número</Label>
                                        <Input value={numero} id="numero" placeholder="Número" required onChange={(e) => setNumero(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="complemento">Complemento</Label>
                                        <Input value={complemento} id="complemento" placeholder="Apartamento, Casa, etc." onChange={(e) => setComplemento(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bairro">Bairro</Label>
                                        <Input value={bairro} id="bairro" placeholder="Seu bairro" required onChange={(e) => setBairro(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cidade">Cidade</Label>
                                        <Input value={cidade} id="cidade" placeholder="Sua cidade" required onChange={(e) => setCidade(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="estado">Estado</Label>
                                        <Input value={estado} id="estado" placeholder="Seu estado" required onChange={(e) => setEstado(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-3 gap-3">
                                    <Button variant={"outline"} onClick={() => cadastroEndereco(false)}>Cancelar</Button>
                                    <Button onClick={() => cadastrarEndereco()}><PlusIcon /></Button>
                                </div>
                            </div>}
                        </CardContent>
                    </TabsContent>
                </Tabs>
            </CardHeader>
            <CardFooter className="flex justify-end">
                <Button onClick={salvarAlteracoes}>Salvar</Button>
            </CardFooter>
            {/* <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input id="city" placeholder="Digite sua cidade" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">Estado</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione seu estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AC">Acre</SelectItem>
                                            <SelectItem value="AL">Alagoas</SelectItem>
                                            <SelectItem value="AP">Amapá</SelectItem>
                                            <SelectItem value="AM">Amazonas</SelectItem>
                                            <SelectItem value="BA">Bahia</SelectItem>
                                            <SelectItem value="CE">Ceará</SelectItem>
                                            <SelectItem value="DF">Distrito Federal</SelectItem>
                                            <SelectItem value="ES">Espírito Santo</SelectItem>
                                            <SelectItem value="GO">Goiás</SelectItem>
                                            <SelectItem value="MA">Maranhão</SelectItem>
                                            <SelectItem value="MT">Mato Grosso</SelectItem>
                                            <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                            <SelectItem value="MG">Minas Gerais</SelectItem>
                                            <SelectItem value="PA">Pará</SelectItem>
                                            <SelectItem value="PB">Paraíba</SelectItem>
                                            <SelectItem value="PR">Paraná</SelectItem>
                                            <SelectItem value="PE">Pernambuco</SelectItem>
                                            <SelectItem value="PI">Piauí</SelectItem>
                                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                            <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                            <SelectItem value="RO">Rondônia</SelectItem>
                                            <SelectItem value="RR">Roraima</SelectItem>
                                            <SelectItem value="SC">Santa Catarina</SelectItem>
                                            <SelectItem value="SP">São Paulo</SelectItem>
                                            <SelectItem value="SE">Sergipe</SelectItem>
                                            <SelectItem value="TO">Tocantins</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">País</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione seu país" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BR">Brasil</SelectItem>
                                        <SelectItem value="US">Estados Unidos</SelectItem>
                                        <SelectItem value="CA">Canadá</SelectItem>
                                        <SelectItem value="MX">México</SelectItem>
                                        <SelectItem value="AR">Argentina</SelectItem>
                                        <SelectItem value="CO">Colômbia</SelectItem>
                                        <SelectItem value="PE">Peru</SelectItem>
                                        <SelectItem value="VE">Venezuela</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div> */}
        </Card>
    )
}