"""
Script de importação de estações - Network Twin / Telebras
Execute com: python importar_estacoes.py
Requer: pip install requests
"""
import requests
import re
import sys

BASE_URL = "https://network-twin-backend.onrender.com"

print("=" * 55)
print("  Network Twin - Importação de Estações Telebras")
print("=" * 55)

# Autenticação
print("\nAutenticando...")
try:
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@telebras.local",
        "password": "admin123"
    }, timeout=30)
except Exception as e:
    print(f"Erro de conexão: {e}")
    sys.exit(1)

if resp.status_code not in (200, 201):
    print(f"Erro ao autenticar: {resp.status_code}")
    print(resp.text)
    sys.exit(1)

token = resp.json().get("accessToken")
print("Autenticado com sucesso!")
headers = {"Authorization": f"Bearer {token}"}

# Todas as estações da planilha (Sheet: Location)
# Formato: (Nome, Cidade - UF, Latitude, Longitude)
estacoes = [
    ("Brasília Geral","Brasília - DF",-15.8117,-47.9506),
    ("Samambaia","Brasília - DF",-15.9239,-48.1719),
    ("RNP - Belo Horizonte","Belo Horizonte - MG",-19.8692,-43.9644),
    ("Bandeirantes","Campo Grande - MS",-19.9175,-54.3719),
    ("Mirueira","Paulista - PE",-7.955,-34.8917),
    ("Banabuiu","Banabuiú - CE",-5.30556,-38.9131),
    ("Vitória","Serra - ES",-20.1919,-40.2947),
    ("Barreiro","Belo Horizonte - MG",-20.0008,-43.9925),
    ("Campos dos Goytacazes","Campos dos Goytacazes - RJ",-21.7217,-41.3397),
    ("Campo Maior","Campo Maior - PI",-4.81556,-42.2014),
    ("Presidente Tancredo Neves","Presidente Tancredo Neves - BA",-13.3692,-39.3803),
    ("Universidade Federal de Mato Grosso do Sul","Campo Grande - MS",-20.5025,-54.6131),
    ("Tatuí","Araçoiaba da Serra - SP",-23.4944,-47.645),
    ("Campina Grande","Campina Grande - PB",-7.26694,-35.9083),
    ("Dourados das Nações","Dourados - MS",-22.2292,-54.7497),
    ("COPE Rio de Janeiro","Rio de Janeiro - RJ",-22.8258,-43.1783),
    ("Mucuri","Mucuri - BA",-18.0789,-39.8592),
    ("Prodepa Tailândia","Tailândia - PA",-2.93528,-48.9508),
    ("São Luís","São Luís - MA",-2.56083,-44.2553),
    ("Resende","Resende - RJ",-22.4983,-44.5144),
    ("Araraquara","Araraquara - SP",-21.7742,-48.2539),
    ("Sauipe","Entre Rios - BA",-11.9842,-38.1947),
    ("Muzambinho","Muzambinho - MG",-21.2683,-46.465),
    ("Vila Camburão (Alenquer)","Alenquer - PA",-1.66306,-54.6792),
    ("Salto Osório","São Jorge d'Oeste - PR",-25.5397,-53.0128),
    ("Jaru","Jaru - RO",-10.4228,-62.4547),
    ("Eletrosul Sede (Florianópolis)","Florianópolis - SC",-27.6067,-48.5214),
    ("Passo Fundo - COPREL","Passo Fundo - RS",-28.2436,-52.38),
    ("Eunápolis","Eunápolis - BA",-16.3381,-39.5508),
    ("Teleporto Salvador","Salvador - BA",-12.9036,-38.3208),
    ("79ª Delegacia de Polícia Civil - Anori","Anori - AM",-3.74167,-61.6564),
    ("Campo Grande (Enersul Sede)","Campo Grande - MS",-20.5764,-54.5878),
    ("Teleporto Florianópolis","Florianópolis - SC",-27.6669,-48.5392),
    ("Prado","Alcobaça - BA",-17.2953,-39.5544),
    ("Carmo do Cajuru","Divinópolis - MG",-20.2194,-44.8231),
    ("São Gabriel do Oeste","São Gabriel do Oeste - MS",-19.4031,-54.5608),
    ("Campus Goiabeiras","Vitória - ES",-20.2733,-40.3042),
    ("Serrinha","Nossa Senhora da Glória - SE",-10.2119,-37.5239),
    ("Peritoró","Peritoro - MA",-4.36778,-44.3303),
    ("Miguel Pereira","Paty do Alferes - RJ",-22.4442,-43.4467),
    ("Juiz de Fora","Juiz de Fora - MG",-21.6264,-43.4947),
    ("São Sebastiao do Uatuma","São Sebastião do Uatumã - AM",-2.56917,-57.8739),
    ("Usina Xingó","Canindé de São Francisco - SE",-9.63306,-37.7947),
    ("Prodepa Jacundá","Jacundá - PA",-4.44583,-49.1111),
    ("São Carlos","Altamira do Paraná - PR",-24.7778,-52.7561),
    ("Camaçari","Dias d'Ávila - BA",-12.6175,-38.3467),
    ("São Mateus","São Mateus - ES",-18.6286,-39.9236),
    ("Arena Manaus","Manaus - AM",-3.08417,-60.0289),
    ("Russas","Russas - CE",-4.94806,-37.9942),
    ("Mussure","João Pessoa - PB",-7.18111,-34.8939),
    ("Campina da Lagoa","Campina da Lagoa - PR",-24.5039,-52.6889),
    ("Caiaponia","Caiapônia - GO",-17.0394,-51.81),
    ("Abunã","Porto Velho - RO",-9.71028,-65.1681),
    ("Serra da Mesa","Minaçu - GO",-13.8239,-48.3003),
    ("Miranda","Miranda do Norte - MA",-3.56556,-44.5344),
    ("RNP - Rio de Janeiro","Rio de Janeiro - RJ",-22.9539,-43.1742),
    ("Ivaiporã","Manoel Ribas - PR",-24.4297,-51.6783),
    ("Aracoiaba","Aracoiaba - CE",-4.55889,-38.6772),
    ("Londrina Contêiner","Londrina - PR",-23.4636,-51.1425),
    ("Naviraí","Naviraí - MS",-23.0706,-54.2108),
    ("Porto Colombia","Planura - MG",-20.1194,-48.5736),
    ("São José","Duque de Caxias - RJ",-22.7483,-43.3311),
    ("Estádio Fonte Nova","Salvador - BA",-12.9786,-38.5042),
    ("Curitiba - Sala Eletrosul","Curitiba - PR",-25.5944,-49.3172),
    ("Juti","Juti - MS",-22.8625,-54.6181),
    ("Arena da Baixada","Curitiba - PR",-25.4478,-49.2758),
    ("Matatu","Salvador - BA",-12.9769,-38.4833),
    ("Camacan","Camacan - BA",-15.3619,-39.5169),
    ("Vitória do Xingu","Vitória do Xingu - PA",-2.9025,-52.0136),
    ("MOB_Telecom_BLM","Belém - PA",-1.41389,-48.4703),
    ("Taubaté","Taubaté - SP",-23.0425,-45.4672),
    ("Grajaú","Grajaú - MA",-5.805,-46.16),
    ("UNICAMP","Campinas - SP",-22.8175,-47.0619),
    ("Sonora","Sonora - MS",-17.5931,-54.7522),
    ("Barra do Corda","Barra do Corda - MA",-5.45444,-45.3108),
    ("Rio Novo do Sul","Itapemirim - ES",-20.8975,-40.9678),
    ("Terra Santa","Terra Santa - PA",-2.10611,-56.4914),
    ("REGAP (Betim)","Betim - MG",-19.9786,-44.1017),
    ("ETEL Cacimbas","Linhares - ES",-19.4622,-39.7619),
    ("RNP - Manaus","Manaus - AM",-3.08806,-59.9647),
    ("COPE Brasília - OS de IP","Brasília - DF",-15.8583,-47.8989),
    ("Nova Rosalândia","Nova Rosalandia - TO",-10.6208,-48.8842),
    ("MOB Telecom","Brasília - DF",-15.79,-47.9158),
    ("Teleporto Campo Grande","Campo Grande - MS",-20.4642,-54.6842),
    ("São João da Fronteira","São João da Fronteira - PI",-4.05917,-41.3014),
    ("Guaraí","Guaraí - TO",-8.85083,-48.4806),
    ("Nova Santa Rita","Nova Santa Rita - RS",-29.8225,-51.3361),
    ("Jacarepagua","Rio de Janeiro - RJ",-22.9236,-43.4222),
    ("Boa Vista","Igaci - AL",-9.50556,-36.5769),
    ("Palmeirópolis","Palmeiropolis - TO",-13.0267,-48.4564),
    ("Governador Mangabeira","Governador Mangabeira - BA",-12.6072,-39.0325),
    ("Rio Verde do MT","Rio Verde de Mato Grosso - MS",-18.7508,-54.8239),
    ("Itacoatiara","Itacoatiara - AM",-2.90306,-59.0917),
    ("Estrategia Altamira","Antonina - PR",-3.27215,-52.1631),
    ("Ribeirao","Ribeirão - PE",-8.46944,-35.3969),
    ("Santa Rita do Araguaia","Santa Rita do Araguaia - GO",-17.3297,-53.2036),
    ("Sitio Novo","Sitio Novo - MA",-5.89528,-46.7342),
    ("Curitiba - RNP","Curitiba - PR",-25.4506,-49.2319),
    ("Tijuco Preto","Mogi das Cruzes - SP",-23.7061,-46.2803),
    ("Bandeirantes (GO)","Aparecida de Goiania - GO",-16.7928,-49.2347),
    ("Porto Velho","Porto Velho - RO",-8.8,-63.8172),
    ("Itabaianinha","Itabaianinha - SE",-11.2883,-37.7181),
    ("Morrinhos","Morrinhos - GO",-17.8,-49.2047),
    ("Itiquira","Itiquira - MT",-17.2214,-54.7594),
    ("Rio Verde Furnas","Rio Verde - GO",-17.7619,-50.8853),
    ("Estação Central do Metrô","Recife - PE",-8.06833,-34.8858),
    ("Natal","Natal - RN",-5.80917,-35.2389),
    ("Coxipo","Cuiabá - MT",-15.6275,-55.9958),
    ("Açu","Açu - RN",-5.59361,-36.9064),
    ("Jataí","Jataí - GO",-17.84,-51.7317),
    ("Gravataí - Sala Eletrosul","Gravataí - RS",-29.8842,-51.0628),
    ("Gandu","Gandu - BA",-13.7442,-39.4975),
    ("RNP-Palmas","Palmas - TO",-10.1789,-48.36),
    ("Caxias","Caxias - MA",-5.29528,-43.7142),
    ("Goiatuba","Goiatuba - GO",-18.0372,-50.0375),
    ("Prodabel - Sede","Belo Horizonte - MG",-19.895,-43.9658),
    ("Mossoró","Mossoró - RN",-5.15139,-37.3494),
    ("UFMS Cuiabá","Cuiabá - MT",-15.6094,-56.0644),
    ("Coxim","Coxim - MS",-18.4989,-54.7325),
    ("Prata","Prata - MG",-19.2678,-48.8458),
    ("Vila do Serrote","Itapagé - CE",-3.80639,-39.4592),
    ("78ª Delegacia de Polícia Civil - Codajás","Codajás - AM",-3.83806,-62.0592),
    ("Maraba","Marabá - PA",-5.19972,-49.0211),
    ("Mineiros","Mineiros - GO",-17.5467,-52.5425),
    ("Iriri","Macaé - RJ",-22.35,-41.9342),
    ("Pirineus","Anápolis - GO",-16.3858,-48.8658),
    ("Foz do Iguacu","Foz do Iguaçu - PR",-25.4606,-54.5472),
    ("RNP - São Luís","São Luís - MA",-2.55556,-44.3089),
    ("Belém - RNP","Belém - PA",-1.475,-48.4558),
    ("Xanxerê","Xanxerê - SC",-26.8636,-52.3922),
    ("Itapeva","Itapeva - SP",-24.0153,-48.5753),
    ("Piripiri","Piripiri - PI",-4.28417,-41.7547),
    ("Santa Maria","Santa Maria do Pará - PA",-1.34333,-47.5803),
    ("Ministério da Infraestrutura","Brasília - DF",-15.7967,-47.8672),
    ("Colinas","Colinas do Tocantins - TO",-7.97083,-48.4561),
    ("Procergs - Centro","Porto Alegre - RS",-30.0386,-51.2308),
    ("Grajau","Rio de Janeiro - RJ",-22.9275,-43.2644),
    ("Campinas - Tanquinho","Campinas - SP",-22.7775,-47.0044),
    ("Umuarama","Umuarama - PR",-23.815,-53.3303),
    ("Jauru","Jauru - MT",-15.3814,-58.8306),
    ("Cascavel","Cascavel - PR",-24.8219,-53.6514),
    ("Dr. Ulysses","Doutor Ulysses - PR",-24.6914,-49.4025),
    ("RNP - Salvador","Salvador - BA",-13.0014,-38.5075),
    ("Recife","Jaboatão dos Guararapes - PE",-8.11444,-35.0378),
    ("Sobral","Sobral - CE",-3.69944,-40.3833),
    ("Gravataí - Contêiner","Gravataí - RS",-29.8817,-51.0614),
    ("32ª Delegacia de Polícia Civil - Caapiranga","Caapiranga - AM",-3.32167,-61.2092),
    ("Barra do Peixe","Ribeirãozinho - MT",-16.4961,-52.6172),
    ("Barueri","Barueri - SP",-23.5086,-46.8128),
    ("EQUINIX SP2","Barueri - SP",-23.5033,-46.8269),
    ("PIX Espirito Santo","Belo Horizonte - MG",-19.9197,-43.9372),
    ("Jurupari (Almeirim)","Almeirim - PA",-1.545,-52.7672),
    ("Coari (TV Amazonas)","Coari - AM",-4.0925,-63.14),
    ("Miracema","Miracema do Tocantins - TO",-9.54194,-48.5194),
    ("Teresina - RNP","Teresina - PI",-5.09611,-42.7989),
    ("Porto Franco","Porto Franco - MA",-6.3475,-47.3756),
    ("Maracanaú","Maracanaú - CE",-3.87278,-38.6108),
    ("Oriximina","Oriximiná - PA",-1.58306,-55.7258),
    ("Ibiúna","Ibiúna - SP",-23.6631,-47.1031),
    ("Mascarenhas de Moraes","Ibiraci - MG",-20.2883,-47.0656),
    ("Pacajá - TIM","Pacajá - PA",-3.84056,-50.6392),
    ("Vila do Conde","Barcarena - PA",-1.57056,-48.7333),
    ("Manacapuru - 9º BPM","Manacapuru - AM",-3.28806,-60.6344),
    ("Centro Administrativo - Lagoa Nova","Natal - RN",-5.83,-35.2153),
    ("Pituaçu","Salvador - BA",-12.9372,-38.4206),
    ("Cachoeira Paulista","Cachoeira Paulista - SP",-22.6317,-45.0361),
    ("Presidente Dutra","Presidente Dutra - MA",-5.26889,-44.4833),
    ("Poços de Caldas","Poços de Caldas - MG",-21.7981,-46.6106),
    ("Manaus Lexuga","Manaus - AM",-2.91972,-60.0139),
    ("Guarulhos (Furnas)","São Paulo - SP",-23.4425,-46.5856),
    ("Paraiso","Paraíso do Tocantins - TO",-10.1453,-48.8264),
    ("Guararema","Guararema - SP",-23.455,-45.9764),
    ("Itumbiara","Araporã - MG",-18.4078,-49.1119),
    ("Campo de Santana (Tacima)","Tacima - PB",-6.49917,-35.6183),
    ("DTSE (Duque de Caxias)","Duque de Caxias - RJ",-22.7094,-43.2503),
    ("Peixe","Peixe - TO",-12.4797,-48.6958),
    ("Furnas","São João Batista do Glória - MG",-20.6658,-46.3208),
    ("Adrianópolis","Nova Iguaçu - RJ",-22.6639,-43.4747),
    ("DTCS (São Caetano do Sul)","São Caetano do Sul - SP",-23.6161,-46.5483),
    ("Fortaleza","Fortaleza - CE",-3.82694,-38.5417),
    ("São Brás do Suaçuí","São Brás do Suaçuí - MG",-20.6169,-43.9325),
    ("Pimenta","Pimenta - MG",-20.47,-45.7944),
    ("Bongi","Recife - PE",-8.06417,-34.9269),
    ("Imperatriz","Imperatriz - MA",-5.42083,-47.4733),
    ("Jaciara","Jaciara - MT",-15.8275,-55.1889),
    ("Araguaína","Araguaína - TO",-7.20306,-48.3208),
    ("Niquelândia","Niquelândia - GO",-14.4342,-48.0864),
    ("Juscimeira","Juscimeira - MT",-16.0553,-54.8839),
    ("Teresina I","Teresina - PI",-5.12806,-42.8019),
    ("Passo Fundo (Entre Rios)","Entre Rios do Sul - RS",-27.4844,-52.7189),
    ("Setor Comercial Sul","Brasília - DF",-15.7953,-47.8933),
    ("Guapore","Guaporé - RS",-28.8472,-51.9478),
    ("Campo Mourão","Campo Mourão - PR",-24.0756,-52.3675),
    ("Barra do Bugres","Barra do Bugres - MT",-15.1272,-56.8219),
    ("Pimenta Bueno","Pimenta Bueno - RO",-11.6083,-61.1372),
    ("US Tucuruí","Tucuruí - PA",-3.82472,-49.6567),
    ("Mimoso","Mimoso de Goiás - GO",-15.0753,-48.14),
    ("Vilhena","Vilhena - RO",-12.7175,-60.2656),
    ("Silves","Silves - AM",-2.7075,-58.2744),
    ("Polícia Militar - Iranduba","Iranduba - AM",-3.27111,-60.1719),
    ("Rondonópolis - GVT","Rondonópolis - MT",-16.4372,-54.6794),
    ("Caucaia","Caucaia - CE",-3.75778,-38.9392),
    ("Alto Garças","Alto Garças - MT",-16.8469,-53.8506),
    ("Ji-Parana","Ji-Paraná - RO",-10.8636,-61.8944),
    ("Guaíra","Guaíra - PR",-24.1006,-54.2386),
    ("Guama","Belém - PA",-1.45972,-48.4453),
    ("Wanderlândia","Wanderlandia - TO",-6.86111,-47.9456),
    ("Nova Alvorada do Sul","Nova Alvorada do Sul - MS",-21.4661,-54.3753),
    ("Miguelópolis","Ituverava - SP",-20.2197,-47.8858),
    ("DTC PRODAM","Manaus - AM",-3.12111,-60.0144),
    ("Gurupi","Gurupi - TO",-11.7358,-49.0117),
    ("Itapé","Itapé - BA",-14.9658,-39.4825),
    ("Xingu (Anapu)","Anapu - PA",-3.10444,-51.6928),
    ("Correios","Rio de Janeiro - RJ",-22.91,-43.2036),
    ("Messias","Messias - AL",-9.40167,-35.8411),
    ("Curitiba - Contêiner","Curitiba - PR",-25.5944,-49.3167),
    ("Jardim","Nossa Senhora do Socorro - SE",-10.8817,-37.1481),
    ("Ariquemes","Ariquemes - RO",-9.9275,-63.0108),
    ("Macapá TIM","Macapá - AP",0.0533333,-51.0556),
    ("Macapá Sub","Macapá - AP",0.0988889,-51.1217),
    ("Comodoro","Comodoro - MT",-13.9303,-59.5097),
]


def parse_city_state(city_raw):
    m = re.search(r'^(.+?)\s*-\s*([A-Z]{2})$', city_raw.strip())
    if m:
        return m.group(1).strip(), m.group(2)
    return city_raw.strip(), ''


print(f"\nImportando {len(estacoes)} estações...\n")

created = 0
errors = 0

for (name, city_raw, lat, lon) in estacoes:
    city, state = parse_city_state(city_raw)
    payload = {
        "name": name,
        "city": city,
        "state": state,
        "latitude": lat,
        "longitude": lon,
        "status": "ONLINE"
    }
    try:
        r = requests.post(
            f"{BASE_URL}/api/stations",
            json=payload,
            headers=headers,
            timeout=20
        )
        if r.status_code in (200, 201):
            created += 1
            print(f"  ✓ [{created:03d}] {name} ({city}, {state})")
        else:
            errors += 1
            print(f"  ✗ ERRO {name}: HTTP {r.status_code} - {r.text[:100]}")
    except Exception as e:
        errors += 1
        print(f"  ✗ ERRO {name}: {e}")

print(f"\n{'=' * 55}")
print(f"  Resultado: {created} criadas | {errors} erros")
print(f"{'=' * 55}")
