# B14: isäntään rajattu moduuli ja kohdennettu selaintarkistus

AUTHORING.md säilyy tavutasolla ennallaan, koska aiemmat testit sitovat sen nimenomaisen version. Tämä tuotannon lisäohje tarkentaa B11:n isäntäohjeen hakualuetta: käytä isännän omaa edeltävää artikkelia, älä koko sisältöalueen ensimmäistä osumaa. Ei muutoksia yhteiseen loaderiin, vanhojen sivujen ajokoodiin tai niiden hyväksyntänäyttöön.

### B14: oman moduulin juuri ja rajattu uusintatarkistus

Koostaja sijoittaa `data-lesson-module`-isännän heti sen oman `article`-elementin jälkeen. Rajaa ladatun moduulin haut tähän omaan artikkeliin. Koko `#lesson-body`-alueen ensimmäinen sopiva elementti ei kelpaa isännän omaksi juureksi: toisen saman KC:n instanssin kiinnitys ei saa alustaa, pysäyttää tai korvata ensimmäistä. Jos suora juurielementin mount on erikseen tuettu, käsittele se eksplisiittisesti. Säilytä juurikohtainen omistajuus, toimimaton vanha rajapinta uusikiinnityksen jälkeen sekä ajastinten ja samojen kuuntelijafunktioiden poisto. Todennus tehdään oikeilla rinnakkaisilla artikkeli–isäntä-pareilla; pelkkä yksi juureen osoittava testifixture ei osoita eristystä.

Oppilaalle näkyvä tehtävän nimi on ymmärrettävää suomea, ei sisäinen avain. Vastaukseen liittyvä säätöpainike lukee näkyvän vastauskokonaisuuden ja poistaa vanhentuneen myönteisen palautteen myös silloin, kun uusi säätö hylätään virheellisen arvon tai rajan vuoksi. Muuttumaton kelvollinen vastaus tai erillisen esimerkin katsominen ei turhaan menetä palautetta. Tämä täsmentää olemassa olevan palautesopimuksen soveltamista; se ei myönnä paikalliselle palautteelle hallinta- tai itsenäisen näytön merkitystä.

Rajaa selaimen uusinta uusiin, muuttuneisiin ja todellisuudessa vaikutuksen alaisiin sivuihin. Muuttumattoman aiemman sivun näyttö voidaan käyttää uudelleen vain ilmoitetun lähde-/toimitustiivistevertailun perusteella. Korjaus yhdeksän uuden moduulin juuren valintaan ei ole muutos jaettuun loaderiin tai aiempien sivujen ajokoodiin. Koko 690-sivuisen verkon rakenne ja linkit tarkistetaan edelleen joka erässä.

