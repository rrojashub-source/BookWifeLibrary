import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Cross, Lightbulb } from "lucide-react";

interface Author {
  name: string;
  description: string;
  period?: string;
  links: {
    label: string;
    url: string;
  }[];
}

interface AuthorCategory {
  title: string;
  description: string;
  authors: Author[];
  testId: string;
}

const categories: AuthorCategory[] = [
  {
    title: "Santos y Doctores de la Iglesia",
    description: "Grandes maestros de la fe reconocidos por su santidad y doctrina",
    testId: "category-santos",
    authors: [
      {
        name: "San Agustín de Hipona",
        description: "Filósofo y teólogo, Doctor de la Iglesia. Autor de 'Confesiones' y 'La Ciudad de Dios'. Sus escritos sobre la gracia, el libre albedrío y la naturaleza de Dios son fundamentales para la teología cristiana.",
        period: "354-430 d.C.",
        links: [
          { label: "Wikipedia", url: "https://es.wikipedia.org/wiki/Agust%C3%ADn_de_Hipona" },
          { label: "Obras en Vatican.va", url: "https://www.vatican.va/holy_father/augustine/index_sp.htm" },
          { label: "Confesiones (texto completo)", url: "https://www.augustinus.it/spagnolo/confessioni/index2.htm" },
        ],
      },
      {
        name: "Santo Tomás de Aquino",
        description: "Doctor de la Iglesia, teólogo y filósofo escolástico. Su obra magna 'Summa Theologiae' es una síntesis sistemática de la doctrina católica y la filosofía aristotélica.",
        period: "1225-1274",
        links: [
          { label: "Wikipedia", url: "https://es.wikipedia.org/wiki/Tom%C3%A1s_de_Aquino" },
          { label: "Summa Theologiae", url: "https://www.corpusthomisticum.org/sth0000.html" },
          { label: "Obras completas", url: "https://www.corpusthomisticum.org/" },
        ],
      },
      {
        name: "Santa Teresa de Ávila",
        description: "Doctora de la Iglesia, mística y reformadora carmelita. Autora de 'El Castillo Interior', 'Camino de Perfección' y 'Las Moradas'. Maestra de la oración contemplativa.",
        period: "1515-1582",
        links: [
          { label: "Wikipedia", url: "https://es.wikipedia.org/wiki/Teresa_de_Jes%C3%BAs" },
          { label: "Obras completas", url: "https://www.carmelitaniscalzi.com/es/santos/teresa-de-jesus/obras" },
          { label: "Las Moradas", url: "https://www.cervantesvirtual.com/obra-visor/las-moradas-o-el-castillo-interior--0/html/" },
        ],
      },
      {
        name: "San Juan de la Cruz",
        description: "Doctor de la Iglesia, místico y poeta carmelita. Autor de 'Noche Oscura del Alma', 'Llama de Amor Viva' y 'Cántico Espiritual'. Maestro de la contemplación mística.",
        period: "1542-1591",
        links: [
          { label: "Wikipedia", url: "https://es.wikipedia.org/wiki/Juan_de_la_Cruz" },
          { label: "Obras completas", url: "https://www.carmelitaniscalzi.com/es/santos/juan-de-la-cruz/obras" },
          { label: "Noche Oscura", url: "https://www.cervantesvirtual.com/obra-visor/noche-oscura-del-alma--0/html/" },
        ],
      },
      {
        name: "San Francisco de Sales",
        description: "Doctor de la Iglesia y obispo de Ginebra. Autor de 'Introducción a la Vida Devota' y 'Tratado del Amor de Dios'. Patrón de escritores y periodistas católicos.",
        period: "1567-1622",
        links: [
          { label: "Wikipedia", url: "https://es.wikipedia.org/wiki/Francisco_de_Sales" },
          { label: "Introducción a la Vida Devota", url: "https://www.cervantesvirtual.com/obra-visor/introduccion-a-la-vida-devota--0/html/" },
        ],
      },
      {
        name: "Santa Teresa de Lisieux",
        description: "Doctora de la Iglesia, conocida como 'La Doctora del Amor'. Autora de 'Historia de un Alma'. Desarrolló la espiritualidad del 'caminito' de confianza y amor.",
        period: "1873-1897",
        links: [
          { label: "Wikipedia", url: "https://es.wikipedia.org/wiki/Teresa_de_Lisieux" },
          { label: "Historia de un Alma", url: "https://www.vatican.va/news_services/liturgy/documents/ns_lit_doc_19101997_stor-anima_sp.html" },
        ],
      },
    ],
  },
  {
    title: "Autores Modernos",
    description: "Escritores y pensadores católicos contemporáneos",
    testId: "category-modernos",
    authors: [
      {
        name: "G.K. Chesterton",
        description: "Escritor, periodista y apologeta británico. Autor de 'Ortodoxia', 'El Hombre Eterno' y las historias del Padre Brown. Maestro del paradoja y la defensa de la fe católica.",
        period: "1874-1936",
        links: [
          { label: "Wikipedia", url: "https://es.wikipedia.org/wiki/G._K._Chesterton" },
          { label: "Ortodoxia (texto)", url: "https://www.cervantesvirtual.com/obra-visor/ortodoxia--0/html/" },
          { label: "Obras en español", url: "https://www.chesterton.org/other-languages/spanish/" },
        ],
      },
      {
        name: "C.S. Lewis",
        description: "Escritor y apologeta británico. Autor de 'Mero Cristianismo', 'El Problema del Dolor' y 'Las Crónicas de Narnia'. Sus obras combinan teología profunda con narrativa accesible.",
        period: "1898-1963",
        links: [
          { label: "Wikipedia", url: "https://es.wikipedia.org/wiki/C._S._Lewis" },
          { label: "C.S. Lewis Society", url: "https://www.cslewis.com/" },
          { label: "Obras traducidas", url: "https://www.cslewis.org/resource/spanish/" },
        ],
      },
      {
        name: "Thomas Merton",
        description: "Monje trapense, escritor y místico estadounidense. Autor de 'La Montaña de los Siete Círculos', 'Semillas de Contemplación'. Exploró el diálogo interreligioso y la espiritualidad contemplativa.",
        period: "1915-1968",
        links: [
          { label: "Wikipedia", url: "https://es.wikipedia.org/wiki/Thomas_Merton" },
          { label: "The Merton Center", url: "https://merton.org/" },
        ],
      },
      {
        name: "San Juan Pablo II",
        description: "Papa (1978-2005). Autor de 'Cruzando el Umbral de la Esperanza', encíclicas como 'Evangelium Vitae' y 'Fides et Ratio'. Promovió el diálogo ecuménico y la nueva evangelización.",
        period: "1920-2005",
        links: [
          { label: "Página del Vaticano", url: "https://www.vatican.va/content/john-paul-ii/es.html" },
          { label: "Encíclicas", url: "https://www.vatican.va/content/john-paul-ii/es/encyclicals.index.html" },
          { label: "Obras completas", url: "https://www.vatican.va/content/john-paul-ii/es/writings.index.html" },
        ],
      },
      {
        name: "Papa Benedicto XVI",
        description: "Papa emérito (2005-2013). Teólogo profundo, autor de 'Jesús de Nazaret' (trilogía), 'Deus Caritas Est' y 'Spe Salvi'. Sus escritos combinan erudición académica con profundidad espiritual.",
        period: "1927-2022",
        links: [
          { label: "Página del Vaticano", url: "https://www.vatican.va/content/benedict-xvi/es.html" },
          { label: "Encíclicas", url: "https://www.vatican.va/content/benedict-xvi/es/encyclicals.index.html" },
          { label: "Jesús de Nazaret", url: "https://www.vatican.va/content/benedict-xvi/es/books.index.html" },
        ],
      },
      {
        name: "Papa Francisco",
        description: "Papa desde 2013. Autor de las encíclicas 'Laudato Si', 'Fratelli Tutti' y 'Evangelii Gaudium'. Enfoca su pontificado en la misericordia, la ecología integral y los pobres.",
        period: "1936-presente",
        links: [
          { label: "Página del Vaticano", url: "https://www.vatican.va/content/francesco/es.html" },
          { label: "Encíclicas y Exhortaciones", url: "https://www.vatican.va/content/francesco/es/documents.index.html" },
          { label: "Laudato Si'", url: "https://www.vatican.va/content/francesco/es/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html" },
        ],
      },
      {
        name: "P. Javier Olivera Ravasi",
        description: "Sacerdote argentino, escritor y apologeta. Fundador de la editorial 'Que no te la cuenten' dedicada a la difusión de la fe católica. Sus obras abordan temas de actualidad desde una perspectiva católica tradicional.",
        period: "1969-presente",
        links: [
          { label: "Editorial Que no te la cuenten", url: "https://editorial.quenotelacuenten.org/productos/" },
          { label: "Sitio web", url: "https://quenotelacuenten.org/" },
        ],
      },
    ],
  },
];

export default function AuthorsPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-authors">
            <Cross className="h-8 w-8 text-primary" />
            Autores Católicos
          </h1>
          <p className="text-muted-foreground mt-2">
            Recursos y enlaces a autores espirituales destacados
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.testId} data-testid={category.testId}>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">{category.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {category.authors.map((author, index) => (
                <Card key={index} data-testid={`card-author-${category.testId}-${index}`} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          {author.name}
                        </CardTitle>
                        {author.period && (
                          <CardDescription className="mt-1 text-xs">
                            {author.period}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {author.description}
                    </p>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Enlaces y recursos:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {author.links.map((link, linkIndex) => (
                          <Button
                            key={linkIndex}
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1"
                            asChild
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid={`link-${category.testId}-${index}-${linkIndex}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              {link.label}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-8 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Nota:</strong> Los enlaces externos te llevarán a recursos confiables como Wikipedia, 
              Vatican.va y sitios oficiales de las órdenes religiosas. Todos se abren en una nueva pestaña.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
