# Warszawska Kwiaciarnia – strona-wizytówka (prototyp)

Jednostronicowa strona dla kwiaciarni na Bemowie (Powstańców Śląskich 24A, naprzeciwko Hali Wola).
Czysty HTML, CSS i odrobina JS. Bez builda, bez zależności, bez backendu. Działa z pliku, z GitHub Pages i z dowolnego hostingu statycznego.

## Trzy odcienie różu do porównania

Prototyp ma przełącznik wariantów (kółka w prawym dolnym rogu ekranu).
Każdy wariant można też otworzyć bezpośrednio z linku:

| Wariant | Charakter | Link |
|---|---|---|
| Pudrowy róż (domyślny) | jasne pudrowe tło, malinowy kolor główny | `…/?theme=pastel` |
| Malinowy | chłodniejszy, bardziej nasycony róż | `…/?theme=raspberry` |
| Stary róż | ciepły, przygaszony, elegancki | `…/?theme=dusty` |

Dodatek `&review=1` pokazuje w rogu etykietę z nazwą aktualnej wersji (przydatne przy omawianiu).

## Animacje

Strona ma jedno, spokojne ustawienie: przy pierwszym wejściu w sesji przeglądarki lotos rysuje się kreską
i odsłania stronę (kliknięcie pomija; `?intro=1` w adresie pokazuje wejście jeszcze raz), zdjęcie w hero
powoli się przybliża, karty unoszą się po najechaniu, karty oferty pojawiają się jedna po drugiej, a kropka
„otwarte” pulsuje. Przy włączonym w systemie ograniczeniu ruchu wejście i animacje są wyłączone.

## Jak uruchomić lokalnie

Wystarczy otworzyć `index.html` w przeglądarce. Jeśli wolisz serwer:

```bash
python -m http.server 8321
```

i wejść na <http://localhost:8321>.

## Struktura

```
index.html            cała treść strony (sekcje oznaczone komentarzami)
assets/css/styles.css style; warianty koloru = trzy bloki zmiennych na górze pliku
assets/js/main.js     przełącznik odcieni, „otwarte teraz”, lightbox, mapa po kliknięciu
assets/js/motion.js   wejście z logo i karty oferty wchodzące po kolei
assets/img/           zdjęcia (WebP) ze starej strony i Instagrama kwiaciarni, logo, favicon, og.jpg
```

Treść zmienia się bezpośrednio w `index.html`. Godziny otwarcia powtarzają się w kilku miejscach i przy zmianie
trzeba poprawić wszystkie: atrybut `data-hours` na plakietce w nagłówku (format `{"1":[9,20], …, "0":[10,16]}`,
0 = niedziela), tabela w sekcji „Odwiedź nas”, linia w sekcji „O nas”, stopka oraz blok JSON-LD w `<head>`.

## Co jest w środku

Nagłówek z telefonem i plakietką „Dziś otwarte do 20:00” → hero → „Jak zamówić” → oferta z cenami orientacyjnymi →
galeria z lightboxem → śluby i eventy / dla firm → o nas → opinie → kontakt z tabelą godzin i mapą → FAQ → stopka.
Na telefonie stały dolny pasek: Zadzwoń · Instagram · Dojazd.

## Do potwierdzenia z właścicielką (zanim strona pójdzie „na prawdę”)

1. Godziny otwarcia (na starej stronie było „codziennie 9–21”, na Instagramie pn–pt 9–20, sb 10–20, nd 10–16) i wyjątki świąteczne.
2. Ceny: „od 100 zł”, flower boxy 120–140 zł, premium 300–400 zł – czy aktualne. Cena roślin doniczkowych.
3. Ocena „4,9” i „ponad 100 opinii” – sprawdzić w wizytówce Google w dniu pokazu; link do opinii.
4. Dowóz: zasięg, koszt, do której godziny można zamówić na dziś. Płatność kartą/BLIK, faktura dla firm.
5. Zgoda na użycie zdjęć ze starej strony i Instagrama; czy są oryginały w lepszej jakości; zdjęcie florystki lub wnętrza.
6. Logo: czy ma lotos w wektorze; czy chce je zachować.
7. Opinie: zgoda na cytowanie trzech opinii z Google z imionami.
8. Śluby: ile wyprzedzenia; czy robi dekoracje plenerowe. Firmy: co dokładnie i dla kogo.
9. Domena kwiaciarniawarszawska.pl: kto ma dostęp do DNS i hostingu home.pl; czy przekierować na nową stronę.
10. Który odcień różu (albo mieszanka) i co zmienić w tekstach.
11. Kod pocztowy: stara strona podaje 01-381 – potwierdzić (w sieci pojawia się też 01-355).
12. Czy odpisuje na wiadomości na Instagramie w godzinach otwarcia (przyciski „Napisz na Instagramie” otwierają od razu wiadomość).

## Przed wdrożeniem produkcyjnym

- [ ] Usunąć `<meta name="robots" content="noindex">` z `index.html`.
- [ ] Usunąć przełącznik odcieni (`.proto-controls` w HTML, blok 1 w `main.js`, część skryptu w `<head>`), zostawić jeden `data-theme` na `<html>` i jeden blok zmiennych w CSS.
- [ ] Ustawić absolutny adres w `og:image` (po ustaleniu domeny).
- [ ] Wkleić aktualne opinie i liczby z Google.
- [ ] Jeśli strona ma iść pod własną domenę: plik `CNAME` w repo i rekordy DNS u operatora domeny.

## GitHub Pages

Repozytorium publiczne, gałąź `main`, katalog główny. Wszystkie ścieżki są względne, więc strona działa pod
`https://<użytkownik>.github.io/<repo>/` bez żadnych zmian.
