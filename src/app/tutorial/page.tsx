import Link from 'next/link';

export default function TutorialPage() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container">
          <Link href="/" className="navbar-brand fw-semibold">
            Concursul „Inomedia. Interferențe Spirituale"
          </Link>
        </div>
      </nav>

      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="h2 fw-bold mb-1">Ghid pentru profesori</h1>
            <p className="text-muted mb-5">Platforma de jurizare — instrucțiuni de utilizare</p>

            {/* Section 1 */}
            <h2 className="h4 fw-semibold mb-3">1. Autentificare</h2>
            <ol className="mb-2">
              <li className="mb-1">Accesează pagina principală și apasă <strong>„Autentificare"</strong>.</li>
              <li className="mb-1">Introdu adresa de email asociată contului tău.</li>
              <li className="mb-1">Vei primi un cod de 6 caractere pe email — introdu-l în pagina următoare.</li>
              <li className="mb-1">Ești autentificat. Dacă nu ai primit codul, îl poți solicita din nou după un minut.</li>
            </ol>
            <div className="alert alert-light border mb-5">
              Contul tău există deja în sistem — nu este nevoie de înregistrare.
            </div>

            {/* Section 2 */}
            <h2 className="h4 fw-semibold mb-3">2. Alegerea metodei de jurizare</h2>
            <p className="mb-4">
              La prima accesare (după ce perioada de jurizare a fost deschisă de organizatori), vei fi rugat să alegi{' '}
              <strong>cum va vota școala ta</strong>. Această alegere se face o singură dată și nu poate fi schimbată ulterior.
            </p>

            <h3 className="h5 fw-semibold mb-2">Jurizare Simplă</h3>
            <p>
              Tu, ca profesor coordonator, introduci direct clasamentul școlii tale. Această opțiune este utilă dacă ai
              consultat elevii în afara platformei și dorești să transmiți rezultatul colectiv.
            </p>
            <p className="fw-semibold mb-2">Cum funcționează:</p>
            <ul className="mb-4">
              <li className="mb-1">Ți se prezintă lista tuturor videoclipurilor din competiție.</li>
              <li className="mb-1">
                Reordonezi lista prin <strong>drag &amp; drop</strong> sau prin butoanele sus/jos, stabilind ordinea
                preferată.
              </li>
              <li className="mb-1">Poți vizualiza fiecare videoclip înainte de a decide.</li>
              <li className="mb-1">
                Când ești mulțumit de ordine, apeși <strong>„Trimite votul"</strong>. Votul este final.
              </li>
            </ul>

            <h3 className="h5 fw-semibold mb-2">Jurizare cu Elevi</h3>
            <p>
              Elevii votează individual pe platformă, iar voturile lor sunt combinate automat într-un singur clasament al
              școlii. Rolul tău este să coordonezi procesul.
            </p>
            <p className="fw-semibold mb-2">Cum funcționează — pas cu pas:</p>

            <p className="fw-semibold mb-1">a) Distribuie accesul elevilor</p>
            <p>Pe pagina ta vei găsi:</p>
            <ul className="mb-3">
              <li className="mb-1">Un <strong>cod de acces</strong> (6 caractere) — îl poți dicta sau scrie pe tablă.</li>
              <li className="mb-1">Un <strong>link direct</strong> — îl poți trimite prin email sau mesaj.</li>
              <li className="mb-1">Un <strong>cod QR</strong> — elevii îl pot scana cu telefonul.</li>
            </ul>
            <p className="mb-3">Oricare dintre acestea duce elevul direct la pagina de votare.</p>

            <p className="fw-semibold mb-1">b) Elevul votează</p>
            <p>Odată intrat pe platformă, elevul:</p>
            <ol className="mb-3">
              <li className="mb-1">Introduce numele și clasa.</li>
              <li className="mb-1">Reordonează videoclipurile și trimite votul.</li>
              <li className="mb-1">
                Pe același dispozitiv poate vota și un alt elev, apăsând „Votează din nou".
              </li>
            </ol>

            <p className="fw-semibold mb-1">c) Monitorizezi voturile primite</p>
            <p>
              În fila <strong>„Voturi primite"</strong> vezi lista tuturor voturilor cu numele și clasa fiecărui elev.
              Dacă identifici un vot invalid sau duplicat, apasă <strong>„Elimină"</strong> — votul rămâne vizibil
              (tăiat cu linie), dar nu mai este luat în calcul. Poți oricând să anulezi eliminarea.
            </p>
            <p className="mb-3">
              Butonul <strong>„Reîncarcă"</strong> actualizează lista cu voturile noi primite.
            </p>

            <p className="fw-semibold mb-1">d) Verifici clasamentul intermediar</p>
            <p className="mb-3">
              Fila <strong>„Clasament curent"</strong> îți arată clasamentul calculat din voturile active ale elevilor
              tăi. Apasă „Reîncarcă" pentru a vedea situația actualizată.
            </p>

            <p className="fw-semibold mb-1">e) Trimiți voturile</p>
            <p className="mb-5">
              Când toți elevii au votat și ai verificat lista, apasă{' '}
              <strong>„Trimite voturile elevilor"</strong> din fila „Voturi primite". Clasamentul școlii tale va fi
              transmis organizatorilor. Acțiunea este finală.
            </p>

            {/* Section 3 */}
            <h2 className="h4 fw-semibold mb-3">3. Cum se calculează scorul</h2>
            <p>
              Indiferent de metoda aleasă, votul școlii tale contribuie cu un singur clasament la concursul național.
              Pozițiile 1–10 primesc puncte astfel: <strong>12, 10, 8, 7, 6, 5, 4, 3, 2, 1</strong>.
            </p>
            <p className="mb-5">
              La <strong>Jurizarea cu Elevi</strong>, voturile individuale ale elevilor sunt mai întâi combinate între
              ele, producând clasamentul școlii. Acesta este apoi punctat (12 la 1) și inclus în totalul național — la
              fel ca un vot simplu.
            </p>

            {/* Section 4 */}
            <h2 className="h4 fw-semibold mb-3">4. Regenerarea codului de acces</h2>
            <p className="mb-5">
              Dacă bănuiești că un cod a ajuns la persoane nedorite, poți genera unul nou din fila{' '}
              <strong>„Instrucțiuni"</strong>, apăsând butonul <strong>„Regenerează"</strong>. Voturile deja primite
              sunt păstrate; codul vechi nu mai poate fi folosit pentru voturi noi.
            </p>

            {/* Section 5 */}
            <h2 className="h4 fw-semibold mb-3">5. Starea perioadei de jurizare</h2>
            <ul>
              <li className="mb-2">
                Dacă perioada <strong>nu a început</strong> sau <strong>s-a încheiat</strong>, platforma îți va afișa
                un mesaj corespunzător și nu vei putea efectua acțiuni de votare.
              </li>
              <li>
                Odată ce ai trimis votul (simplu sau cu elevi), procesul este complet — vei vedea o confirmare pe ecran.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
