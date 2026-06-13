'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlayerStore } from '@/store/playerStore'
import { api } from '@/lib/api'
import type { UnifiedSearchResult, Track } from '@/types'
import { Play, Music, Loader2, TrendingUp, ChevronLeft, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

// Genre name → image filename (mirrors page.tsx mapping)
const genreImages: Record<string, string> = {
  Rock: '/genres/Rock_Guitar.png', Jazz: '/genres/Jazz.png', Classical: '/genres/Classical.png',
  'R&B': '/genres/RnB.png', 'Hip-Hop': '/genres/HipHop.png', Ambient: '/genres/Ambient.png',
  Electronic: '/genres/Electronic.png', Reggae: '/genres/Reggae.png', Samba: '/genres/Samba.png',
  Latin: '/genres/Latin.png', Gospel: '/genres/Gospel.png', Pagode: '/genres/Pagode.png',
  'Heavy Metal': '/genres/HeavyMetal.png', Rap: '/genres/Rap.png', 'Forró': '/genres/Forro.png',
  Funk: '/genres/Funk.png', Sertanejo: '/genres/Sertanejo.png', Romantic: '/genres/Romantic.png',
  Trap: '/genres/Trap.png',
}

/** 100-artist catalog per genre — searched via iTunes API for preview-enabled tracks */
const GENRE_QUERIES: Record<string, { name: string; queries: string[] }> = {
  rock: { name: 'Rock', queries: [       'Queen Bohemian Rhapsody','Nirvana Smells Like Teen Spirit','Led Zeppelin Stairway to Heaven','ACDC Back in Black','Pink Floyd Comfortably Numb','Foo Fighters Everlong','The Rolling Stones Paint It Black','Guns N Roses Sweet Child O Mine','The Beatles Come Together','Red Hot Chili Peppers Californication','U2 With or Without You','The Who Baba O Riley','Pearl Jam Alive','Green Day Boulevard of Broken Dreams','Linkin Park In the End','Eagles Hotel California','Bon Jovi Livin on a Prayer','The Killers Mr Brightside','Jimi Hendrix Purple Haze','The Doors Light My Fire','Lynyrd Skynyrd Sweet Home Alabama','Fleetwood Mac Go Your Own Way','Aerosmith Dream On','Def Leppard Pour Some Sugar On Me','Van Halen Jump','Journey Dont Stop Believin','Tom Petty Free Fallin','Bruce Springsteen Born to Run','The Clash Should I Stay or Should I Go','Ramones Blitzkrieg Bop','Radiohead Creep','Weezer Buddy Holly','Blink 182 All the Small Things','Oasis Wonderwall','Arctic Monkeys Do I Wanna Know','The Strokes Last Nite','Muse Uprising','Kings of Leon Use Somebody','Coldplay Clocks','David Bowie Heroes','The Police Every Breath You Take','Rush Tom Sawyer','ZZ Top La Grange','Creedence Clearwater Revival Fortunate Son','Santana Smooth','Scorpions Wind of Change','Deep Purple Smoke on the Water','Soundgarden Black Hole Sun','Alice in Chains Man in the Box','The White Stripes Seven Nation Army','Black Sabbath Iron Man','The Kinks You Really Got Me','T Rex Bang a Gong','The Cure Just Like Heaven','The Smiths There Is a Light','Joy Division Love Will Tear Us Apart','R.E.M. Losing My Religion','The Cranberries Zombie','Smashing Pumpkins 1979','Stone Temple Pilots Interstate Love Song','Jane Says Nothing Shocking','Nine Inch Nails Closer','Depeche Mode Enjoy the Silence','Talking Heads Once in a Lifetime','Blondie Heart of Glass','The Cars Just What I Needed','Boston More Than a Feeling','Kansas Carry On Wayward Son','Styx Come Sail Away','Yes Roundabout','Genesis Invisible Touch','Phil Collins In the Air Tonight','Peter Gabriel Solsbury Hill','Steve Miller Band The Joker','Doobie Brothers Listen to the Music','Allman Brothers Ramblin Man','ZZ Top Sharp Dressed Man','Stevie Ray Vaughan Pride and Joy','Eric Clapton Layla','Derek and the Dominos Layla','Jeff Beck Cause Weve Ended As Lovers','Dire Straits Sultans of Swing','Mark Knopfler What It Is','Pink Floyd Wish You Were Here','The Beatles Let It Be','The Rolling Stones Gimme Shelter','Led Zeppelin Kashmir','The Who Won\'t Get Fooled Again','Queen We Will Rock You','ACDC Highway to Hell','Guns N Roses November Rain','Nirvana Come As You Are','Pearl Jam Jeremy','Soundgarden Spoonman','Foo Fighters Learn to Fly','Red Hot Chili Peppers Under the Bridge', ] },
  jazz: { name: 'Jazz', queries: [       'Miles Davis So What','John Coltrane Giant Steps','Louis Armstrong What a Wonderful World','Dave Brubeck Take Five','Billie Holiday Strange Fruit','Duke Ellington Mood Indigo','Ella Fitzgerald Summertime','Thelonious Monk Round Midnight','Charles Mingus Goodbye Pork Pie Hat','Chet Baker My Funny Valentine','Charlie Parker Ornithology','Dizzy Gillespie Night in Tunisia','Herbie Hancock Cantaloupe Island','Nina Simone Feeling Good','Oscar Peterson Hymn to Freedom','Count Basie One OClock Jump','Art Blakey Moanin','Wes Montgomery Round Midnight','Sonny Rollins St Thomas','Dexter Gordon Blue Bossa','Cannonball Adderley Mercy Mercy Mercy','Wayne Shorter Footprints','Sarah Vaughan Lullaby of Birdland','Stan Getz Girl from Ipanema','Pat Metheny Last Train Home','Chick Corea Spain','Keith Jarrett The Köln Concert','Weather Report Birdland','Joe Henderson Recorda Me','Clifford Brown Joy Spring','Lee Morgan The Sidewinder','Hank Mobley Soul Station','Benny Goodman Sing Sing Sing','Glenn Miller In the Mood','Django Reinhardt Minor Swing','Cole Porter Night and Day','George Gershwin Rhapsody in Blue','Nat King Cole Unforgettable','Ray Charles Georgia on My Mind','Etta James At Last','Diana Krall The Look of Love','Norah Jones Dont Know Why','Jamie Cullum What a Difference a Day Made','Gregory Porter Liquid Spirit','Esperanza Spalding I Know You Know','Kamasi Washington Truth','Robert Glasper So Beautiful','Christian Scott Sunrise','Nubya Garcia Source','Alfa Mist Keep On','Wynton Marsalis Black Codes','Branford Marsalis Requiem','Joshua Redman Jazz Crimes','Chris Potter The Sirens','Brad Mehldau When It Rains','Jason Moran Blue Blocks','Vijay Iyer Historicity','Ambrose Akinmusire The Beauty of All Things','Terence Blanchard Breathless','Roy Hargrove Strasbourg St Denis','Nicholas Payton The Three Trumpeters','Kenny Garrett Happy People','Joe Lovano I\'m All For You','Michael Brecker Delta City Blues','David Sanborn Chicago Song','Grover Washington Jr Just the Two of Us','Bob James Angela','George Benson Breezin','Al Jarreau Mornin','Bobby McFerrin Dont Worry Be Happy','Take 6 Spread Love','Manhattan Transfer Birdland','New York Voices Round Midnight','Sergio Mendes Mas Que Nada','Antonio Carlos Jobim Desafinado','Joao Gilberto Chega de Saudade','Milton Nascimento Cravo e Canela','Egberto Gismonti Agua e Vinho','Hermeto Pascoal Bebe','Airto Moreira Tombo in 7/4','Flora Purim Light As a Feather','Return to Forever Spain','Mahavishnu Orchestra Birds of Fire','Billy Cobham Stratus','Tony Williams Lifetime Emergency','Jaco Pastorius Portrait of Tracy','Marcus Miller Power','Victor Wooten Amazing Grace','Stanley Clarke School Days','Ron Carter All Blues','Charles Mingus Haitian Fight Song','Thelonious Monk Blue Monk','Art Tatum Tea for Two', ] },
  classical: { name: 'Classical', queries: [ 'Beethoven Symphony 5','Mozart Requiem Lacrimosa','Bach Cello Suite No 1','Vivaldi Four Seasons Spring','Chopin Nocturne Op 9 No 2','Tchaikovsky Swan Lake','Debussy Clair de Lune','Pachelbel Canon in D','Handel Messiah Hallelujah','Wagner Ride of the Valkyries','Strauss Blue Danube','Grieg Morning Mood','Rachmaninoff Piano Concerto 2','Ravel Bolero','Satie Gymnopedie No 1','Schubert Ave Maria','Mendelssohn Wedding March','Brahms Hungarian Dance','Dvorak New World Symphony','Smetana Moldau','Stravinsky Firebird Suite','Holst The Planets Jupiter','Mahler Symphony 5 Adagietto','Bach Air on the G String','Beethoven Moonlight Sonata','Mozart Eine Kleine Nachtmusik','Haydn Surprise Symphony','Tchaikovsky Nutcracker Suite','Prokofiev Romeo and Juliet','Shostakovich Waltz 2','Bach Toccata and Fugue in D minor','Verdi Dies Irae','Puccini Nessun Dorma','Rossini William Tell Overture','Bizet Carmen Habanera','Massenet Meditation from Thais','Elgar Pomp and Circumstance','Albinoni Adagio in G minor','Barber Adagio for Strings','Copland Fanfare for the Common Man','John Williams Star Wars Theme','Hans Zimmer Time','Ludovico Einaudi Nuvole Bianche','Yiruma River Flows in You','Max Richter Vivaldi Recomposed','Olafur Arnalds Saman','Alexis Ffrench Bluebird','Vikingur Olafsson Bach Reworks','Yo-Yo Ma Bach Cello Suite','Lang Lang Piano Book', ] },
  rnb: { name: 'R&B', queries: [          'Blinding Lights The Weeknd','SZA Kill Bill','Frank Ocean Thinkin Bout You','Usher Yeah','Alicia Keys Fallin','Beyonce Halo','Rihanna Diamonds','Chris Brown With You','Bruno Mars Thats What I Like','Mary J Blige Family Affair','TLC Waterfalls','Destinys Child Say My Name','Lauryn Hill Doo Wop','D Angelo Untitled','Erykah Badu On and On','Janet Jackson Thats the Way Love Goes','Toni Braxton Un Break My Heart','Boyz II Men End of the Road','Mariah Carey We Belong Together','Whitney Houston I Wanna Dance With Somebody','Michael Jackson Rock With You','Stevie Wonder Superstition','Prince Kiss','Marvin Gaye Lets Get It On','Anita Baker Sweet Love','Maxwell Ascension','Jill Scott A Long Walk','Ne-Yo So Sick','Khalid Location','Daniel Caesar Get You','H.E.R. Best Part','Summer Walker Girls Need Love','Jazmine Sullivan Pick Up Your Feelings','Snoh Aalegra I Want You Around','Brent Faiyaz Dead Man Walking','Giveon Heartbreak Anniversary','Lucky Daye Over','SiR John Redcorn','Masego Tadow','Ari Lennox Pressure','Jhene Aiko Sativa','Kehlani Distraction','Tinashe 2 On','Victoria Monet On My Mama','Coco Jones ICU','Chris Brown Under the Influence','Beyonce Cuff It','SZA Snooze','Miguel Adorn','Solange Cranes in the Sky', ] },
  'hip-hop': { name: 'Hip-Hop', queries: [  'Kendrick Lamar Humble','Drake Gods Plan','Travis Scott Sicko Mode','J Cole No Role Modelz','Eminem Lose Yourself','Kanye West Stronger','Lil Wayne Lollipop','Jay Z 99 Problems','Nas NY State of Mind','50 Cent In Da Club','Outkast Hey Ya','Snoop Dogg Drop It Like Its Hot','Tupac California Love','Notorious BIG Juicy','Ice Cube It Was a Good Day','Migos Stir Fry','Cardi B Bodak Yellow','Megan Thee Stallion Savage','Nicki Minaj Super Bass','ASAP Rocky Praise the Lord','Tyler the Creator See You Again','Denzel Curry Ultimate','JID Surround Sound','Big Sean I Dont F with You','Meek Mill Dreams and Nightmares','Rick Ross Hustlin','Future Codeine Crazy','Wiz Khalifa Black and Yellow','Mac Miller Self Care','Chance the Rapper No Problem','Kid Cudi Pursuit of Happiness','Lupe Fiasco Kick Push','Common The Light','Mos Def Mathematics','The Roots You Got Me','Busta Rhymes Put Your Hands','DMX Party Up','Missy Elliott Work It','Fugees Killing Me Softly','Wu Tang Clan CREAM','Mobb Deep Shook Ones','Nate Dogg Regulate','A Tribe Called Quest Scenario','De La Soul Me Myself and I','Run DMC Walk This Way','Beastie Boys Sabotage','LL Cool J Mama Said Knock You Out','Salt N Pepa Push It','Grandmaster Flash The Message','The Notorious BIG Hypnotize', ] },
  ambient: { name: 'Ambient', queries: [     'Brian Eno An Ending Ascent','Aphex Twin Rhubarb','Stars of the Lid Requiem for Dying Mothers','Hammock Blankets of Night','Tycho Awake','Sigur Ros Hoppipolla','Moby Porcelain','Boards of Canada Dayvan Cowboy','Explosions in the Sky Your Hand in Mine','Jon Hopkins Light Through the Veins','Nils Frahm Says','Olafur Arnalds Near Light','Max Richter On the Nature of Daylight','Helios Eingya','Loscil Endless Falls','Hiroshi Yoshimura Green','Biosphere Poa Alpina','William Basinski Disintegration Loops','Harold Budd The Room','Eluvium Prelude for Time Feelers','Grouper Heavy Water','Julianna Barwick The Harbinger','A Winged Victory for the Sullen Atomos','Dustin OHalloran Opus 23','Goldmund Threnody','Library Tapes Fragment','Bing and Ruth As Much as Possible','Adam Wiltzie Tissue of Lies','Christina Vantzou No 3','Rafael Anton Irisarri Waking Expectations','Taylor Deupree Snow Dust','Chihei Hatakeyama A Long Journey','Celer Discourses of the Withered','Steve Roach Structures from Silence','Robert Rich Somnium','Michael Stearns Planetary Unfolding','Laraaji Sun Zither','Pauline Oliveros Deep Listening','Sarah Davachi Evensong','Kaitlyn Aurelia Smith The Kid','Mary Lattimore Silver Ladders','Emily A Sprague Water Memory','Tim Hecker Ravedeath','Fennesz Endless Summer','Gas Pop','Alva Noto Xerrox','Ryuichi Sakamoto async','Brian Eno Music for Airports','Aphex Twin Stone in Focus','Lusine ICL Ghost', ] },
  electronic: { name: 'Electronic', queries: ['Daft Punk Get Lucky','Calvin Harris Summer','Avicii Wake Me Up','Skrillex Scary Monsters','Deadmau5 Strobe','Disclosure Latch','Zedd Clarity','Major Lazer Lean On','Flume Never Be Like You','ODESZA Say My Name','Porter Robinson Language','Marshmello Alone','Kygo Firestone','David Guetta Titanium','Tiësto Red Lights','Martin Garrix Animals','Swedish House Mafia Dont You Worry Child','Illenium Good Things Fall Apart','Armin van Buuren This Is What It Feels Like','Above and Beyond Sun and Moon','Eric Prydz Call on Me','The Chainsmokers Closer','Galantis Runaway','Bassnectar Timestretch','Pretty Lights Finally Moving','GRiZ Good Times Roll','Rufus Du Sol Innerbloom','Bob Moses Tearing Me Up','Lane 8 Fingerprint','Bonobo Cirrus','Four Tet Two Thousand and Seventeen','Caribou Cant Do Without You','Aphex Twin Windowlicker','Squarepusher Beep Street','The Chemical Brothers Galvanize','Fatboy Slim Praise You','The Prodigy Breathe','Moby Go','Orbital Halcyon','Underworld Born Slippy','Jungle Busy Earnin','Kaytranada Lite Spots','Mura Masa Lovesick','Fred Again Jungle','Jamie xx Loud Places','Floating Points Last Bloom','Peggy Gou Starry Night','Bicep Glue','Overmono So U Kno','Sofia Kourtesis La Perla', ] },
  reggae: { name: 'Reggae', queries: [       'Bob Marley One Love','Peter Tosh Legalize It','Jimmy Cliff The Harder They Come','Toots and the Maytals Pressure Drop','Damian Marley Welcome to Jamrock','Steel Pulse Ku Klux Klan','UB40 Red Red Wine','Burning Spear Marcus Garvey','Desmond Dekker Israelites','Gregory Isaacs Night Nurse','Dennis Brown Revolution','Lee Scratch Perry Disco Devil','Buju Banton Champion','Sean Paul Temperature','Shaggy It Wasnt Me','Ziggy Marley True to Myself','Alpha Blondy Jerusalem','Morgan Heritage Dont Haffi Dread','Chronixx Smile Jamaica','Protoje Who Knows','Koffee Toast','Jesse Royal Modern Day Judas','Kabaka Pyramid Kontraband','Pressure Busspipe Love and Affection','Tarrus Riley Shes Royal','Romain Virgo Star Across the Sky','Christopher Martin Big Deal','Busy Signal One Way Ticket','Mavado So Special','Popcaan Family','Vybz Kartel Fever','Alkaline Champion Boy','Beres Hammond Rockaway','Marcia Griffiths Electric Boogie','Third World 96 Degrees','Yellowman Zungguzunggug','Eek A Mouse Wa Do Dem','Barrington Levy Here I Come','Sister Nancy Bam Bam','Tenor Saw Ring the Alarm','Super Cat Ghetto Red Hot','Shabba Ranks Mr Loverman','Cocoa Tea Rikers Island','Ini Kamoze Here Comes the Hotstepper','Maxi Priest Close to You','Wayne Wonder No Letting Go','Gyptian Hold You','Mr Vegas Heads High','Beenie Man Who Am I','Elephant Man Pon de River', ] },
  samba: { name: 'Samba', queries: [         'Jorge Ben Mas que Nada','Cartola Preciso Me Encontrar','Beth Carvalho Vou Festejar','Paulinho da Viola Coração Leviano','Martinho da Vila Canta Canta','Alcione Não Deixe o Samba Morrer','Zeca Pagodinho Deixa a Vida Me Levar','Clara Nunes O Mar Serenou','João Nogueira Espelho','Dona Ivone Lara Sonho Meu','Arlindo Cruz Meu Lugar','Diogo Nogueira Tô Fazendo Falta','Roberta Sá Ah Se Eu Vou','Maria Rita Cara Valente','Teresa Cristina Meu Mundo é Hoje','Adoniran Barbosa Trem das Onze','Noel Rosa Com Que Roupa','Candeia Dia de Graça','Nelson Sargento Agoniza Mas Não Morre','Monarco Vai Amanhecer','Wilson das Neves O Samba é Meu Dom','Jair Rodrigues Deixa Isso Pra Lá','Elizeth Cardoso Barracão','Elza Soares Mulher do Fim do Mundo','Mariana Aydar Tá','Céu Malemolência','Liniker Zero','Elis Regina Águas de Março','Gal Costa Baby','Caetano Veloso Sampa','Gilberto Gil Aquele Abraço','Chico Buarque Construção','Tom Jobim Wave','Vinícius de Moraes Garota de Ipanema','Baden Powell Berimbau','Toquinho Aquarela','Djavan Oceano','Seu Jorge Tive Razão','Criolo Não Existe Amor em SP','Emicida AmarElo','Samba de Raiz Compromisso','Grupo Fundo de Quintal Samba é No Fundo','Neguinho da Beija Flor O Campeão','Jamalão Eterno Carnaval','Jamelão Exaltação à Mangueira','Estação Primeira de Mangueira Hino','Beija Flor de Nilópolis Samba Enredo','Império Serrano Heróis da Liberdade','Portela Contos de Areia','Salgueiro Explode Coração', ] },
  latin: { name: 'Latin', queries: [         'Despacito Luis Fonsi','Shakira Hips Dont Lie','Bad Bunny Tití Me Preguntó','J Balvin Mi Gente','Daddy Yankee Gasolina','Karol G Provenza','Rauw Alejandro Todo de Ti','Ozuna Se Preparó','Nicky Jam El Perdón','Becky G Sin Pijama','Maluma Felices los 4','Anuel AA China','Farruko Pepas','Rosalía Despechá','Sech Relación','Camilo Vida de Rico','Manuel Turizo La Bachata','Myke Towers La Playa','Feid Remix Exclusivo','Blessd Madura','Ryan Castro Jordan','Peso Pluma Ella Baila Sola','Grupo Frontera No Se Va','Carin Leon Primera Cita','Romeo Santos Propuesta Indecente','Aventura Obsesión','Prince Royce Corazón Sin Cara','Marc Anthony Vivir Mi Vida','Enrique Iglesias Bailando','Ricky Martin Livin La Vida Loca','Jennifer Lopez On The Floor','Gloria Estefan Conga','Celia Cruz La Vida Es Un Carnaval','Tito Puente Oye Como Va','Héctor Lavoe El Cantante','Willie Colón Idilio','Rubén Blades Pedro Navaja','Juan Luis Guerra Burbujas de Amor','Carlos Vives La Tierra del Olvido','Maná Rayando el Sol','Soda Stereo De Música Ligera','Los Fabulosos Cadillacs Matador','Café Tacvba Eres','Natalia Lafourcade Hasta la Raíz','Mon Laferte Tu Falta de Querer','Julieta Venegas Limón y Sal','Carla Morrison Déjenme Llorar','Shakira Ojos Así','Enrique Iglesias Hero','Luis Miguel La Incondicional', ] },
  gospel: { name: 'Gospel', queries: [       'Amazing Grace','Kirk Franklin Stomp','CeCe Winans Alabaster Box','Tasha Cobbs Break Every Chain','Donnie McClurkin Stand','Marvin Sapp Never Would Have Made It','Fred Hammond Were Blessed','Yolanda Adams Open My Heart','Hezekiah Walker Every Praise','Tamela Mann Take Me to the King','Sinach Way Maker','Elevation Worship Graves Into Gardens','Hillsong Worship What a Beautiful Name','Casting Crowns Who Am I','MercyMe I Can Only Imagine','Chris Tomlin How Great Is Our God','Lauren Daigle You Say','Kari Jobe Forever','Bethel Music Goodness of God','Phil Wickham This Is Amazing Grace','Brandon Lake Gratitude','Maverick City Music Jireh','Jonathan McReynolds Make Room','Todd Dulaney Victory Belongs to Jesus','William McDowell I Give Myself Away','Tye Tribbett What Can I Do','Jekalyn Carr Youre Bigger','Smokie Norful I Need You Now','Kurt Carr For Every Mountain','Byron Cage The Presence of the Lord','Israel Houghton Friend of God','Matt Redman 10000 Reasons','Hillsong United Oceans','Jesus Culture Rooftops','Travis Greene Made a Way','Tasha Page Lockhart Different','Geoffrey Golden Glory to the Lamb','The Clark Sisters You Brought the Sunshine','Walter Hawkins Going Up Yonder','Andrae Crouch The Blood','Shirley Caesar Hold My Mule','James Cleveland Peace Be Still','Mahalia Jackson How I Got Over','Aretha Franklin Precious Lord','Elvis Presley How Great Thou Art','Johnny Cash Gods Gonna Cut You Down','Carrie Underwood Jesus Take the Wheel','Michael W Smith Above All','Amy Grant El Shaddai','Steven Curtis Chapman Dive', ] },
  pagode: { name: 'Pagode', queries: [       'Grupo Revelação Deixa Acontecer','Exaltasamba Me Apaixonei','Sorriso Maroto Sinais','Fundo de Quintal O Show Tem Que Continuar','Raça Negra Cheia de Manias','Turma do Pagode Camisa 10','Molejo Cilada','Só Pra Contrariar Depois do Prazer','Karametade Mel da Sua Boca','Art Popular Pimpolho','Soweto Mundo de Oz','Jeito Moleque Meu Jeito','Péricles Até Que Durou','Ferrugem Pirata e Tesouro','Dilsinho Péssimo Negócio','Thiaguinho Ousadia e Alegria','Mumuzinho Fulminante','Belo Tua Boca','Alexandre Pires Mineirinho','Rodriguinho Minha Música','Sorriso Maroto Assim Você Mata o Papai','Exaltasamba Telegrama','Os Travessos Adivinha','Inimigos da HP Mulher de Amigo Meu','Samprazer Não Precisa Mudar','Sem Compromisso Dois','Nuwance Só Pro Meu Prazer','Katinguelê Inaraí','Pique Novo Recado','Grupo Clareou Vestido Branco','Grupo Menos é Mais Lapada Dela','Xande de Pilares Deixa Eu Te Amar','Dudu Nobre A Grande Família','Marquinhos Sensação Eu Não Vou','Grupo Disfarce Na Sua Estante','Grupo Malícia Primeiro Lugar','Alô Som Brilho no Olhar','Swing e Simpatia Quem de Nós','Nosso Sentimento Pra Ser Feliz','Grupo Art Popular Saigon','Tomate A Noite','Kiloucura Por Tão Pouco','Grupo Raça Negra É Tarde Demais','Pé de Moleque Vem Cá','Grupo Razão Brasileira Do jeito que eu sou','Só no Sapatinho Meu Amor é Todo Seu','Ginga e Malícia Temporal','Grupo Tempero Cheiro de Shampoo','Grupo Relíquia Pra Ser Feliz', ] },
  'heavy-metal': { name: 'Heavy Metal', queries: ['Metallica Enter Sandman','Iron Maiden The Trooper','Black Sabbath Paranoid','Slayer Raining Blood','Megadeth Symphony of Destruction','Judas Priest Breaking the Law','Pantera Walk','System of a Down Chop Suey','Tool Schism','Ozzy Osbourne Crazy Train','Motörhead Ace of Spades','Anthrax Madhouse','Slipknot Duality','Avenged Sevenfold Hail to the King','Disturbed Down With the Sickness','Rammstein Du Hast','Korn Freak on a Leash','Lamb of God Laid to Rest','Mastodon Blood and Thunder','Gojira Stranded','Opeth Ghost of Perdition','Trivium In Waves','Killswitch Engage My Curse','As I Lay Dying Nothing Left','Architects Doomsday','Bring Me the Horizon Throne','Bullet for My Valentine Tears Dont Fall','Machine Head Davidian','Sepultura Roots Bloody Roots','Soulfly Jumpdafuckup','Dio Holy Diver','Rainbow Man on the Silver Mountain','Deep Purple Highway Star','Led Zeppelin Whole Lotta Love','ACDC Thunderstruck','Guns N Roses Welcome to the Jungle','Scorpions Rock You Like a Hurricane','Whitesnake Still of the Night','Testament Over the Wall','Exodus Toxic Waltz','Death Crystal Mountain','Carcass Heartwork','At the Gates Blinded by Fear','In Flames Only for the Weak','Amon Amarth Twilight of the Thunder God','Children of Bodom Hate Me','Nightwish Nemo','Within Temptation Ice Queen','Evanescence Bring Me to Life','Static X Push It', ] },
  rap: { name: 'Rap', queries: [             'Eminem Rap God','Jay Z Empire State of Mind','Nas NY State of Mind','2Pac California Love','Notorious BIG Juicy','Lil Wayne A Milli','Kendrick Lamar DNA','Drake Hotline Bling','J Cole Middle Child','Travis Scott Goosebumps','Future Mask Off','21 Savage Bank Account','Migos Bad and Boujee','Lil Baby Drip Too Hard','Post Malone Rockstar','NF The Search','Logic Homicide','Denzel Curry Ultimate','Joyner Lucas Im Not Racist','Tech N9ne Speedom','Wiz Khalifa See You Again','Polo G Rapstar','Rod Wave Heart on Ice','Juice WRLD Robbery','Lil Uzi Vert XO Tour Llif3','Playboi Carti Magnolia','A Boogie Wit da Hoodie Drowning','NBA YoungBoy Outside Today','YNW Melly Murder on My Mind','Tyler the Creator Earfquake','ASAP Rocky Praise the Lord','ScHoolboy Q Collard Greens','Pusha T If You Know You Know','Freddie Gibbs Crime Pays','Benny the Butcher Johnny Ps Caddy','Conway the Machine The Cow','Boldy James Carruth','Black Thought Aquamarine','Royce da 59 Boom','Griselda DR BIRDS','Joey Bada$$ Devastated','Flatbush Zombies Palm Trees','Lauryn Hill Doo Wop','Fugees Ready or Not','Wyclef Jean Gone Till November','Busta Rhymes Break Ya Neck','Twista Overnight Celebrity','Nelly Country Grammar','Ludacris Stand Up','T.I. What You Know', ] },
  forro: { name: 'Forró', queries: [         'Luiz Gonzaga Asa Branca','Dominguinhos Eu Só Quero Um Xodó','Elba Ramalho De Volta Pro Aconchego','Alceu Valença Anunciação','Falamansa Xote dos Milagres','Geraldo Azevedo Táxi Lunar','Marinês Peba no Pão','Jackson do Pandeiro Sebastiana','Zé Ramalho Chão de Giz','Mastruz com Leite Meu Vaqueiro Meu Peão','Cavalo de Pau Mulher de Fases','Catuaba com Amendoim Eu Sou do Nordeste','Rastapé Colo de Menina','Bicho de Pé Nosso Xote','Forróçacana Baião de Dois','Aviões do Forró Não Me Deixe','Wesley Safadão Camarote','Xand Avião Se Mordendo de Amor','Calcinha Preta Hoje à Noite','Magníficos Me Usa','Banda Eva Leva Eu','Chiclete com Banana Quero Chiclete','Asa de Águia Não Tem Lua','Timbalada Beija Flor','Daniela Mercury O Canto da Cidade','Ivete Sangalo Festa','Claudia Leitte Exttravasa','Léo Santana Rebolada','Harmonia do Samba Daquele Jeito','Banda Feras Ela Pirou','Saia Rodada Prefiro a Verdade','Forró do Muído Mulher Roleira','Solteirões do Forró Novinha','Garota Safada Disfarça','Dorgival Dantas Coração','Flávio José Tareco e Mariola','Santanna O Ferreirinha','Genival Lacerda Severina Xique Xique','Triângulo Nordestino Forró do Xenhenhem','Triângulo de Ouro Mexe Mexe','Mestre Zinho Vem Morena','Jorge de Altinho Gotas de Álcool','Petrúcio Amorim Filho do Dono','Zé Cantor De Ponta a Ponta','Cheiro de Menina Vai','Limão com Mel Anjo Querubim','Forró Real Amor de Rapariga','Bonde do Forró Leviana','Forró Saborear Porque Te Amo','Aduílio Mendes Pedaço de Mim', ] },
  funk: { name: 'Funk', queries: [           'Anitta Envolver','MC Kevinho Olha a Explosão','Ludmilla Cheguei','MC Don Juan','Kevin O Chris Tipo Gin','DJ Marlboro Rap do Silva','MC Livinho Fazer Falta','MC Zaac Bumbum Granada','MC Fioti Bum Bum Tam Tam','MC Kekel Namorar Pra Quê','MC João Baile de Favela','Valesca Popozuda Sou a Diva','Lexa Sapequinha','Pabllo Vittar K.O.','Gloria Groove Bonekinha','MC Pedrinho Dom Dom Dom','MC Guimê País do Futebol','MC Catra Uh Papai Chegou','MC G15 Deu Onda','MC Menor Mr Pinto','MC TH Amor de Verdade','MC Jhojho Meu Lugar','MC Davi Final de Semana','MC Nandinho Minha Preferida','Kondzilla Bum Bum Tam Tam','Ludmilla Din Din Din','Anitta Show das Poderosas','Pedro Sampaio Dançarina','Luisa Sonza Braba','Pocah Não Sou Obrigada','Tati Zaqui Água na Boca','MC Mirella Quero Ver','MC Rebecca Ao Som do 150','MC Loma Envolvimento','MC MM Eu Vou Tacar','MC Delano Quero Que Tu Vá','MC Novinho da 2D Saudade','MC Pikachu Oh Novinha','DJ RD Dança do Créu','DJ Maluco Tuim','DJ Jamaika Funk do Morto','MC Gorila Gigante','MC Neguinho do Kaxeta O Mundão Girou','MC Daleste São Paulo','Bonnie e Clyde Vem Ca Menina','MC Dani Boladão','MC Magrela e MC Fox 150 BPM','MC 2K Alô Amor','DJ Guuga Cavalo de Troia','MC Teteu Olha o Barulhinho', ] },
  sertanejo: { name: 'Sertanejo', queries: [ 'Jorge e Mateus Sosseguei','Marília Mendonça Infiel','Henrique e Juliano Não Tô Valendo Nada','Zé Neto e Cristiano Largado as Traças','Gusttavo Lima Apelido Carinhoso','Luan Santana Acordando o Prédio','Maiara e Maraisa 10 Por Cento','Simone e Simaria Loka','Matheus e Kauan Que Sorte a Nossa','Fernando e Sorocaba Bom Rapaz','Michel Teló Ai Se Eu Te Pego','Bruno e Marrone Dormi na Praça','Victor e Leo Borboletas','Chitãozinho e Xororó Evidências','Leonardo Pense em Mim','Leandro e Leonardo Um Sonhador','Zezé Di Camargo e Luciano É o Amor','Daniel Quando Eu Canto','Cristiano Araújo Maus Bocados','João Neto e Frederico Lê Lê Lê','Israel e Rodolfo Marca Evidente','Bruno e Barretto Farra e Amor','Munhoz e Mariano Camaro Amarelo','Thaeme e Thiago Ai Que Dó','Paula Fernandes Pássaro de Fogo','Naiara Azevedo 50 Reais','Simone e Simaria Foi Mal','Marcos e Belutti Domingo de Manhã','Jads e Jadson Na Rua','João Bosco e Vinícius Chora Me Liga','César Menotti e Fabiano Como Um Anjo','Edson e Hudson Azul','Gino e Geno Mulher de Amigo Meu','Teodoro e Sampaio Paixão Proibida','Milionário e José Rico Estrada da Vida','João Mineiro e Marciano Ainda Ontem Chorei de Saudade','Rionegro e Solimões Saudade de Minha Terra','Gian e Giovani O Grande Amor da Minha Vida','Rick e Renner nos Bares da Cidade','Eduardo Costa Cachaceiro','Guilherme e Santiago E Daí','Cleber e Cauan Quase','Lucas Lucco Vai Vendo','Gabriel Gava Fiorino','Gustavo Mioto Anti Amor','Zé Felipe e Miguel Só Não Divulga','Nando Moreno Noites Traiçoeiras','Jorge Lucas Cowboy','Fiduma e Jeca O Nome Disso é Saudade','Zé Ricardo e Thiago Sinal Disfarçado', ] },
  romantic: { name: 'Romantic', queries: [    'Ed Sheeran Perfect','Adele Someone Like You','John Legend All of Me','Sam Smith Stay With Me','Whitney Houston I Will Always Love You','Celine Dion My Heart Will Go On','Elton John Your Song','Lionel Richie Hello','Mariah Carey We Belong Together','Bruno Mars Just the Way You Are','Ed Sheeran Thinking Out Loud','Alicia Keys If I Aint Got You','Beyonce Halo','James Arthur Say You Wont Let Go','Christina Perri A Thousand Years','Jason Mraz Im Yours','Leona Lewis Bleeding Love','Coldplay Yellow','Bryan Adams Everything I Do','Richard Marx Right Here Waiting','Phil Collins Against All Odds','Eric Clapton Wonderful Tonight','Joe Cocker You Are So Beautiful','Foreigner I Want to Know What Love Is','Air Supply Making Love Out of Nothing At All','Chicago Youre the Inspiration','REO Speedwagon Cant Fight This Feeling','Cyndi Lauper Time After Time','George Michael Careless Whisper','Sade No Ordinary Love','Norah Jones Come Away with Me','Michael Bublé Home','Josh Groban You Raise Me Up','Andrea Bocelli Time to Say Goodbye','Il Divo Regresa a Mi','Luciano Pavarotti Caruso','Frank Sinatra My Way','Dean Martin Thats Amore','Nat King Cole LOVE','Etta James At Last','Louis Armstrong La Vie En Rose','Tony Bennett The Way You Look Tonight','Kina Grannis Cant Help Falling In Love','Daniel Caesar Best Part','Joe Hisaishi Howls Moving Castle Theme','Ludovico Einaudi I Giorni','Yann Tiersen Comptine dun autre été','The Piano Guys A Thousand Years','Elvis Presley Cant Help Falling In Love','Ray Charles You Dont Know Me', ] },
  trap: { name: 'Trap', queries: [            'Travis Scott Goosebumps','Future Mask Off','Migos Bad and Boujee','Lil Baby Drip Too Hard','21 Savage Bank Account','Post Malone Rockstar','Gunna Drip Too Hard','Young Thug The London','Playboi Carti Magnolia','Metro Boomin Creepin','Pop Smoke Dior','Juice WRLD Lucid Dreams','Roddy Ricch The Box','DaBaby Rockstar','Jack Harlow Whats Poppin','Drake Nonstop','Lil Uzi Vert XO Tour Llif3','Cardi B Money','Lil Yachty One Night','Rae Sremmurd Black Beatles','BlocBoy JB Look Alive','MadeinTYO Uber Everywhere','Famous Dex Japan','Rich The Kid New Freezer','Lil Pump Gucci Gang','Smokepurpp Audi','Sheck Wes Mo Bamba','Fetty Wap Trap Queen','Kodak Black Roll in Peace','Offset Ric Flair Drip','Quavo Workin Me','Takeoff Casper','Key Glock Ambition For Cash','Young Dolph Get Paid','Moneybagg Yo Time Today','Pooh Shiesty Back in Blood','EST Gee Balloons','42 Dugg We Paid','Baby Keem Family Ties','Don Toliver No Idea','SoFaygo Knock Knock','Yeat Money So Big','Ken Carson Yale','Destroy Lonely NOSTYLIST','Cochise Tell Em','Lancey Foux India','Ski Mask The Slump God Faucet Failure','Comethazine Walk','NLE Choppa Shotta Flow','Lil Tecca Ransom', ] },
}

export default function GenreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = useTranslation()
  const resolvedParams = React.use(params)
  const { setQueue } = usePlayerStore()
  const [tracks, setTracks] = useState<UnifiedSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const slug = resolvedParams.slug
  const genre = GENRE_QUERIES[slug]
  const displayName = genre?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const queries = genre?.queries ?? [displayName]

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      const results: UnifiedSearchResult[] = []
      for (const q of queries) {
        if (cancelled) return
        try {
          const data = await api.musicSearch(q, 1)
          const track = data.tracks[0]
          if (track && track.track && track.track.title) results.push(track)
        } catch { /* skip */ }
      }
      if (!cancelled) setTracks(results)
      if (!cancelled) setIsLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  function handlePlay(result: UnifiedSearchResult, idx: number) {
    const all: Track[] = tracks
      .filter((r) => r.track)
      .map((r, i) => ({
        id: r.track?.mbid ?? `genre-${slug}-${i}`,
        title: r.track?.title ?? '',
        artist: r.artist?.name ?? '',
        album: r.album?.title ?? '',
        duration: r.track?.duration ? Math.round(r.track.duration / 1000) : 200,
        format: 'MP3' as const,
        coverUrl: r.cover_url ?? r.album?.cover_url ?? undefined,
        previewUrl: r.track?.preview_url ?? null,
      }))
    setQueue(all, idx)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with genre image banner */}
        <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden">
          <Image
            src={genreImages[displayName] ?? '/genres/Rock_Guitar.png'}
            alt={displayName}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-clark-bg-primary via-clark-bg-primary/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center gap-4">
            <Link href="/genres" className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-3xl tracking-widest uppercase text-white drop-shadow-lg">{displayName}</h1>
              <p className="font-body text-sm text-white/70 mt-1">
                {isLoading ? 'Loading...' : `${tracks.length} tracks`}
              </p>
            </div>
          </div>
        </div>

        {/* Track grid — Spotify-style cards */}
        {isLoading ? (
          <div role="status" aria-label="Loading tracks" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl bg-clark-bg-secondary animate-pulse">
                <div className="aspect-square rounded-lg bg-clark-bg-card" />
                <div className="h-4 bg-clark-bg-card rounded mt-3 w-3/4" />
                <div className="h-3 bg-clark-bg-card rounded mt-1 w-1/2" />
              </div>
            ))}
            <span className="sr-only">Loading tracks...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tracks.map((result, idx) => {
              const track = result.track
              const artist = result.artist
              const coverUrl = result.cover_url ?? result.album?.cover_url ?? null
              const previewUrl = track?.preview_url
              if (!track) return null

              const trackObj: Track = {
                id: track.mbid ?? `genre-${slug}-${idx}`,
                title: track.title,
                artist: artist?.name ?? '',
                album: result.album?.title ?? '',
                duration: track.duration ? Math.round(track.duration / 1000) : 200,
                format: 'MP3',
                coverUrl: coverUrl ?? undefined,
                previewUrl: previewUrl ?? null,
              }

              return (
                <div
                  key={track.mbid ?? `${slug}-${idx}`}
                  onClick={() => handlePlay(result, idx)}
                  className="group p-3 rounded-xl bg-clark-bg-secondary hover:bg-clark-bg-card transition-all duration-200 cursor-pointer hover:scale-[1.02] border border-transparent hover:border-clark-steel/20"
                >
                  {/* Album art with play overlay */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-clark-steel to-clark-bg-card shadow-md">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={`${track.title} album cover`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" aria-label={`Play ${track.title}`}>
                      <div className="w-10 h-10 rounded-full bg-clark-accent flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Track info */}
                  <div className="flex items-center gap-2 mt-3">
                    <p className="font-body font-semibold text-sm text-clark-text-primary truncate flex-1">
                      {track.title}
                    </p>
                    {previewUrl && (
                      <button
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-clark-gold/10 text-clark-gold transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          usePlayerStore.getState().playPreview(previewUrl, trackObj)
                        }}
                        aria-label={`Preview ${track.title}`}
                        title={t('previewLabel')}
                      >
                        <Headphones className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="font-body text-xs text-clark-text-muted truncate">
                    {artist?.name ?? 'Unknown'}
                  </p>

                  {/* Popularity bar */}
                  {result.popularity > 0 && (
                    <div className="mt-2 h-1 bg-clark-bg-primary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-clark-gold to-clark-accent"
                        style={{ width: `${result.popularity}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && tracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music className="w-12 h-12 text-clark-text-muted/30 mb-4" />
            <p className="font-body text-clark-text-muted">No tracks found for {displayName}. Try searching instead.</p>
            <Link href="/search" className="mt-3 text-clark-gold font-body text-sm hover:underline">
              Go to Search
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
