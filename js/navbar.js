// ============================================
// NAVBAR UNIVERSAL — ATTOS2 v2.0
// "E todos foram cheios do Espírito Santo" - Atos 2:4
// ============================================
// Insere a navbar completa com mega dropdowns,
// preview, search, user menu, música e carrinho.
// Detecta automaticamente se está em subpasta (pages/, admin/)
// para ajustar os caminhos relativos.
// Aguarda DOMContentLoaded para injetar no body.
// ============================================

(function() {
  'use strict';

  // ============================================
  // DETECTAR CONTEXTO
  // ============================================
  var path = window.location.pathname;
  var emSubpasta = path.indexOf('/pages/') !== -1 || path.indexOf('/admin/') !== -1;
  var r = emSubpasta ? '..' : '.';

  // ============================================
  // INJETAR CSS
  // ============================================
  var css = [
    '.preview-portal{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);width:340px;max-width:calc(100vw - 40px);background:rgba(20,20,20,0.98);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid rgba(212,175,55,0.3);border-radius:16px;padding:24px;z-index:9999;box-shadow:0 20px 60px rgba(0,0,0,0.6);opacity:0;visibility:hidden;transition:opacity 0.25s ease,visibility 0.25s}',
    '.preview-portal.active{opacity:1;visibility:visible}',
    '.preview-portal .pp-image{width:100%;height:160px;background:linear-gradient(135deg,#2E0A4A,#4A0E17);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:3rem;margin-bottom:12px;overflow:hidden}',
    '.preview-portal .pp-image img{width:100%;height:100%;object-fit:cover;border-radius:12px}',
    '.preview-portal .pp-name{font-size:1rem;font-weight:700;margin-bottom:4px}',
    '.preview-portal .pp-verse{color:#D4AF37;font-size:0.8rem;margin-bottom:6px;text-shadow:0 0 10px rgba(212,175,55,0.5)}',
    '.preview-portal .pp-price{font-size:1.2rem;color:#D4AF37;font-weight:700;margin-bottom:10px}',
    '.preview-portal .pp-modelos{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}',
    '.preview-portal .pp-modelos span{padding:4px 12px;border:1px solid rgba(212,175,55,0.3);border-radius:6px;font-size:0.75rem;font-family:Arial,sans-serif;cursor:pointer;transition:all 0.2s}',
    '.preview-portal .pp-modelos span:hover{background:#D4AF37;color:#050505}',
    '.preview-portal .pp-btn{display:block;width:100%;padding:10px;background:linear-gradient(135deg,#D4AF37,#FFD700);border:none;border-radius:8px;color:#050505;font-weight:700;font-size:0.85rem;cursor:pointer;text-decoration:none;text-align:center;transition:transform 0.2s}',
    '.preview-portal .pp-btn:hover{transform:scale(1.02)}',
    '.preview-portal .pp-close{position:absolute;top:12px;right:12px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.2rem;cursor:pointer;padding:4px;line-height:1;transition:color 0.2s}',
    '.preview-portal .pp-close:hover{color:#fff}',
    '.preview-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;opacity:0;visibility:hidden;transition:opacity 0.25s ease,visibility 0.25s}',
    '.preview-overlay.active{opacity:1;visibility:visible}',
    '@media(min-width:769px){.preview-portal,.preview-overlay{display:none!important}}',
    '.user-dropdown-portal{position:fixed;min-width:200px;background:rgba(15,15,15,0.98);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:8px;z-index:99999;box-shadow:0 20px 60px rgba(0,0,0,0.8);opacity:0;visibility:hidden;transition:opacity 0.2s,visibility 0.2s}',
    '.user-dropdown-portal.active{opacity:1;visibility:visible}',
    '.user-dropdown-portal a{display:flex;align-items:center;gap:10px;padding:10px 14px;color:rgba(255,255,255,0.8);text-decoration:none;font-family:Arial,sans-serif;font-size:0.8rem;letter-spacing:1px;border-radius:8px;transition:all 0.2s}',
    '.user-dropdown-portal a:hover{background:rgba(212,175,55,0.1);color:#D4AF37}',
    '.user-dropdown-portal a.danger:hover{background:rgba(255,69,0,0.1);color:#FF6B35}',
    '.user-dropdown-portal hr{border:none;border-top:1px solid rgba(212,175,55,0.1);margin:4px 0}',
    '.user-dropdown-portal a i{font-size:1.1rem}',
    '.user-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:99998;opacity:0;visibility:hidden;transition:opacity 0.2s,visibility 0.2s}',
    '.user-overlay.active{opacity:1;visibility:visible}',
    '.user-dropdown-desktop{position:relative}',
    '.user-dropdown-desktop .user-dropdown{position:absolute;top:100%;right:0;min-width:180px;background:rgba(15,15,15,0.98);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:8px;z-index:9999;box-shadow:0 20px 60px rgba(0,0,0,0.8);opacity:0;visibility:hidden;transition:opacity 0.2s,visibility 0.2s;margin-top:8px}',
    '.user-dropdown-desktop .user-dropdown a{display:flex;align-items:center;gap:10px;padding:10px 14px;color:rgba(255,255,255,0.8);text-decoration:none;font-family:Arial,sans-serif;font-size:0.8rem;letter-spacing:1px;border-radius:8px;transition:all 0.2s}',
    '.user-dropdown-desktop .user-dropdown a:hover{background:rgba(212,175,55,0.1);color:#D4AF37}',
    '.user-dropdown-desktop .user-dropdown a.danger:hover{background:rgba(255,69,0,0.1);color:#FF6B35}',
    '.user-dropdown-desktop .user-dropdown hr{border:none;border-top:1px solid rgba(212,175,55,0.1);margin:4px 0}',
    '.user-dropdown-desktop .user-dropdown a i{font-size:1.1rem}',
    '.user-dropdown-desktop .user-dropdown.active{opacity:1;visibility:visible}',
    '@media(max-width:768px){.user-dropdown-desktop .user-dropdown{display:none}}',
    '@media(min-width:769px){.user-dropdown-portal{display:none!important}}',
    '.search-bar{position:fixed;top:0;left:0;right:0;z-index:99997;background:rgba(10,10,10,0.98);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-bottom:1px solid rgba(212,175,55,0.2);padding:0 20px;height:0;overflow:hidden;transition:height 0.35s cubic-bezier(0.16,1,0.3,1),padding 0.35s cubic-bezier(0.16,1,0.3,1);display:flex;align-items:center;gap:12px}',
    '.search-bar.active{height:64px;padding:0 20px}',
    '.search-bar input{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(212,175,55,0.2);border-radius:8px;padding:12px 16px;color:#fff;font-family:Arial,sans-serif;font-size:0.9rem;outline:none;transition:border-color 0.3s}',
    '.search-bar input:focus{border-color:#D4AF37}',
    '.search-bar input::placeholder{color:rgba(255,255,255,0.3)}',
    '.search-bar .search-close{background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.4rem;cursor:pointer;padding:4px;line-height:1;transition:color 0.2s;display:flex;align-items:center}',
    '.search-bar .search-close:hover{color:#fff}',
    '.search-bar .search-go{background:#D4AF37;border:none;border-radius:8px;padding:12px 20px;color:#050505;font-family:Arial,sans-serif;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer;transition:background 0.3s;white-space:nowrap}',
    '.search-bar .search-go:hover{background:#FFD700}',
    '@media(max-width:768px){.search-bar.active{height:60px;padding:0 12px}.search-bar input{font-size:0.85rem;padding:10px 12px}.search-bar .search-go{padding:10px 14px;font-size:0.7rem}}',
    '.music-fab{position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#FFD700);border:none;color:#050505;font-size:1.4rem;cursor:pointer;z-index:9999;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(212,175,55,0.4);transition:all 0.3s ease}',
    '.music-fab:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(212,175,55,0.6)}',
    '.music-fab.playing{animation:musicPulse 2s ease-in-out infinite}',
    '@keyframes musicPulse{0%,100%{box-shadow:0 4px 20px rgba(212,175,55,0.4)}50%{box-shadow:0 4px 40px rgba(212,175,55,0.8)}}',
    '.music-fab i{display:inline-flex;align-items:center;justify-content:center;line-height:1}',
    '@media(max-width:768px){.music-fab{bottom:16px;right:16px;width:44px;height:44px;font-size:1.2rem}}',
    '.dropdown-items{max-height:380px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(212,175,55,0.3) transparent}',
    '.dropdown-items::-webkit-scrollbar{width:4px}',
    '.dropdown-items::-webkit-scrollbar-track{background:transparent}',
    '.dropdown-items::-webkit-scrollbar-thumb{background:rgba(212,175,55,0.3);border-radius:2px}',
    '.dropdown-items::-webkit-scrollbar-thumb:hover{background:rgba(212,175,55,0.5)}',
    '.dropdown-loading{padding:16px;text-align:center;color:rgba(255,255,255,0.4);font-size:0.75rem;letter-spacing:2px}',
    '.mega-dropdown-portal{position:fixed;top:60px;left:8px;right:8px;z-index:9998;background:#1a1a1a;border:0.5px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(8px);transition:opacity 0.25s ease,transform 0.25s ease,visibility 0.25s;box-shadow:0 8px 32px rgba(0,0,0,0.5);max-height:70vh;overflow-y:auto}',
    '.mega-dropdown-portal.active{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0)}',
    '.mega-dropdown-portal .dropdown-header{font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.4);padding:0 8px 8px;font-family:Arial,sans-serif}',
    '.mega-dropdown-portal .dropdown-items{display:flex;flex-direction:column;gap:2px}',
    '.mega-dropdown-portal .dropdown-item{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:8px;text-decoration:none;color:rgba(255,255,255,0.8);gap:12px;transition:background 0.2s}',
    '.mega-dropdown-portal .dropdown-item:hover{background:rgba(255,255,255,0.06)}',
    '.mega-dropdown-portal .item-info{display:flex;flex-direction:column;gap:2px}',
    '.mega-dropdown-portal .item-name{font-size:13px;font-weight:500;font-family:Georgia,serif}',
    '.mega-dropdown-portal .item-verse{font-size:11px;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif}',
    '.mega-dropdown-portal .item-price{font-size:12px;color:#D4AF37;white-space:nowrap;font-family:Arial,sans-serif}',
    '.mega-dropdown-portal .dropdown-footer{display:flex;align-items:center;justify-content:space-between;padding:8px 10px 0;margin-top:8px;border-top:0.5px solid rgba(255,255,255,0.08);font-size:12px;font-weight:500;color:#D4AF37;text-decoration:none;font-family:Arial,sans-serif;transition:color 0.2s}',
    '.mega-dropdown-portal .dropdown-footer:hover{color:#FFD700}',
    '@media(min-width:769px){.mega-dropdown-portal{display:none!important}}',
    'body.attos-has-navbar{padding-top:80px}',
    '@media(max-width:768px){body.attos-has-navbar{padding-top:58px}}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ============================================
  // FIREBASE INIT (lazy, com verificação de duplicata)
  // ============================================
  function ensureFirebase() {
    if (window.__attos2_db) return window.__attos2_db;
    if (typeof firebase === 'undefined') return null;
    try {
      if (!firebase.apps.length) {
        var firebaseConfig = {
          apiKey: "AIzaSyBVXuBi31G9pfviNGUY6uZ_1cFudKthmU0",
          authDomain: "attos2-c2644.firebaseapp.com",
          projectId: "attos2-c2644",
          storageBucket: "attos2-c2644.firebasestorage.app",
          messagingSenderId: "1021391388902",
          appId: "1:1021391388902:web:b349b39a74994569bebb27",
          measurementId: "G-WQYHW5DPBC"
        };
        firebase.initializeApp(firebaseConfig);
      }
      window.__attos2_db = firebase.firestore();
      window.__attos2_auth = firebase.auth();
      return window.__attos2_db;
    } catch(e) {
      console.warn('Navbar: Firebase init error:', e);
      return null;
    }
  }

  // ============================================
  // INICIALIZAR TUDO (após DOM pronto)
  // ============================================
  function inicializar() {
    injetarHTML();
    setupTablerIcons();
    setupDropdownPortal();
    setupPreviewPanel();
    setupPreviewPortal();
    setupCartBadge();
    setupSearchBar();
    setupUserDropdown();
    setupAuth();
    setupMusicPlayer();

    // Carregar dados dinâmicos
    carregarDropdowns();

    // Mobile nav scroll animation
    if (window.innerWidth <= 768) {
      setTimeout(function() {
        var navScroll = document.querySelector('.nav-scroll');
        if (navScroll) {
          navScroll.scrollTo({ left: navScroll.scrollWidth, behavior: 'smooth' });
          setTimeout(function() {
            navScroll.scrollTo({ left: 0, behavior: 'smooth' });
          }, 1500);
        }
      }, 600);
    }
  }

  // ============================================
  // 1. INJETAR HTML
  // ============================================
  function injetarHTML() {
    var h = '';

    // Preview Panel (desktop: hover)
    h += '<div class="preview-panel" id="previewPanel">';
    h += '<div class="preview-image" id="previewImage">&#x1F455;</div>';
    h += '<div class="preview-name" id="previewName">Camiseta</div>';
    h += '<div class="preview-verse" id="previewVerse">Versículo</div>';
    h += '<div class="preview-price" id="previewPrice">R$ 00,00</div>';
    h += '<div class="preview-modelos" id="previewModelos"></div>';
    h += '<a href="#" class="preview-btn" id="previewBtnDetalhes">Ver produto</a>';
    h += '</div>';

    // Preview Overlay + Portal (mobile)
    h += '<div class="preview-overlay" id="previewOverlay"></div>';
    h += '<div class="preview-portal" id="previewPortal">';
    h += '<button class="pp-close" id="ppClose">&times;</button>';
    h += '<div class="pp-image" id="ppImage">&#x1F455;</div>';
    h += '<div class="pp-name" id="ppName">Camiseta</div>';
    h += '<div class="pp-verse" id="ppVerse">Versículo</div>';
    h += '<div class="pp-price" id="ppPrice">R$ 00,00</div>';
    h += '<div class="pp-modelos" id="ppModelos"></div>';
    h += '<a href="#" class="pp-btn" id="ppBtnDetalhes">Ver produto</a>';
    h += '</div>';

    // Audio player (hidden)
    h += '<audio id="bgMusic" loop preload="metadata"></audio>';

    // Search Bar
    h += '<div class="search-bar" id="searchBar">';
    h += '<input type="text" id="searchInput" placeholder="Buscar produtos ou versículos..." autocomplete="off">';
    h += '<button class="search-go" id="searchGo"><i class="ti ti-search"></i> Buscar</button>';
    h += '<button class="search-close" id="searchClose">&times;</button>';
    h += '</div>';

    // Music FAB
    h += '<button class="music-fab" id="musicBtn" title="Ativar música"><i class="ti ti-music"></i></button>';

    // NAVBAR
    h += '<nav class="navbar"><div class="nav-scroll">';
    h += '<a href="' + r + '/index.html" class="logo"><img src="' + r + '/logo2.png" alt="ATTOS2"></a>';
    h += '<button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>';
    h += '<ul class="nav-links" id="navLinks">';
    h += '<li><a href="' + r + '/index.html">Home</a></li>';
    // Masculino dropdown
    h += '<li class="dropdown" data-categoria="masculino"><a href="#">Masculino <span class="dropdown-arrow">&#9660;</span></a>';
    h += '<div class="mega-dropdown"><div class="dropdown-header">Masculino</div><div class="dropdown-items" id="dropdownMasculino"><div class="dropdown-loading">Carregando...</div></div>';
    h += '<a href="' + r + '/pages/produtos.html?categoria=masculino" class="dropdown-footer">Ver toda a coleção masculina <i class="ti ti-arrow-right"></i></a></div></li>';
    // Feminino dropdown
    h += '<li class="dropdown" data-categoria="feminino"><a href="#">Feminino <span class="dropdown-arrow">&#9660;</span></a>';
    h += '<div class="mega-dropdown"><div class="dropdown-header">Feminino</div><div class="dropdown-items" id="dropdownFeminino"><div class="dropdown-loading">Carregando...</div></div>';
    h += '<a href="' + r + '/pages/produtos.html?categoria=feminino" class="dropdown-footer">Ver toda a coleção feminina <i class="ti ti-arrow-right"></i></a></div></li>';
    // Infantil dropdown
    h += '<li class="dropdown" data-categoria="infantil"><a href="#">Infantil <span class="dropdown-arrow">&#9660;</span></a>';
    h += '<div class="mega-dropdown"><div class="dropdown-header">Infantil</div><div class="dropdown-items" id="dropdownInfantil"><div class="dropdown-loading">Carregando...</div></div>';
    h += '<a href="' + r + '/pages/produtos.html?categoria=infantil" class="dropdown-footer">Ver toda a coleção infantil <i class="ti ti-arrow-right"></i></a></div></li>';
    // Rest of nav
    h += '<li><a href="' + r + '/pages/produtos.html">Destaques</a></li>';
    h += '<li class="nav-divider"></li>';
    h += '<li><button class="nav-icon-btn" id="searchBtn" aria-label="Buscar"><i class="ti ti-search"></i></button></li>';
    h += '<li><a href="' + r + '/pages/carrinho.html" class="nav-icon-btn" aria-label="Carrinho"><i class="ti ti-shopping-cart"></i><span class="cart-badge" id="cartCountNav" data-count="0">0</span></a></li>';
    h += '<li class="dropdown user-dropdown-desktop">';
    h += '<button class="nav-icon-btn" id="userMenuBtn" aria-label="Minha conta"><i class="ti ti-user"></i></button>';
    h += '<div class="user-dropdown" id="userDropdown">';
    h += '<a href="#"><i class="ti ti-user"></i> Minha conta</a>';
    h += '<a href="' + r + '/pages/perfil.html"><i class="ti ti-edit"></i> Meu Perfil</a>';
    h += '<a href="' + r + '/pages/pedidos.html"><i class="ti ti-package"></i> Meus pedidos</a>';
    h += '<hr><a href="#" id="logoutBtn" class="danger"><i class="ti ti-logout"></i> Sair</a>';
    h += '</div></li></ul></div></nav>';

    // Overlays
    h += '<div class="mobile-menu-overlay" id="menuOverlay"></div>';
    h += '<div class="user-overlay" id="userOverlay"></div>';
    h += '<div class="user-dropdown-portal" id="userDropdownPortal"></div>';

    document.body.insertAdjacentHTML('afterbegin', h);
    document.body.classList.add('attos-has-navbar');
  }

  // ============================================
  // 2. TABLER ICONS
  // ============================================
  function setupTablerIcons() {
    if (!document.querySelector('link[href*="tabler-icons"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css';
      document.head.appendChild(link);
    }
  }

  // ============================================
  // 3. MEGA DROPDOWN PORTAL (mobile)
  // ============================================
  function setupDropdownPortal() {
    var portal = document.createElement('div');
    portal.className = 'mega-dropdown-portal';
    document.body.appendChild(portal);
    var active = null;

    document.addEventListener('click', function(e) {
      var link = e.target.closest('.dropdown > a');
      if (!link) return;
      if (window.innerWidth > 768) return;
      e.preventDefault();

      var drop = link.closest('.dropdown');
      var mega = drop.querySelector('.mega-dropdown');

      if (active === drop) {
        portal.classList.remove('active');
        active = null;
        return;
      }

      portal.innerHTML = mega.innerHTML;
      var h = document.querySelector('.navbar').offsetHeight;
      portal.style.top = h + 'px';
      portal.classList.add('active');
      active = drop;
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown') && !e.target.closest('.mega-dropdown-portal')) {
        portal.classList.remove('active');
        active = null;
      }
    });
  }

  // ============================================
  // 4. PREVIEW PANEL (desktop: hover)
  // ============================================
  function setupPreviewPanel() {
    var panel = document.getElementById('previewPanel');
    var aberto = false;

    function mostrar(nome, preco, versiculo, imagem, modelos, produtoId) {
      document.getElementById('previewName').textContent = nome || 'Produto';
      document.getElementById('previewPrice').textContent = preco || 'R$ 00,00';
      document.getElementById('previewVerse').textContent = versiculo || '';
      var imgEl = document.getElementById('previewImage');
      if (imagem) {
        imgEl.innerHTML = '<img src="' + imagem + '" alt="' + (nome || '') + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;pointer-events:none;user-select:none" draggable="false">';
      } else {
        imgEl.innerHTML = '&#x1F455;';
      }
      var modEl = document.getElementById('previewModelos');
      if (modelos && modelos.length > 0) {
        modEl.innerHTML = '<span style="font-size:0.65rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px">Modelos</span>' +
          modelos.map(function(m) { return '<span style="padding:2px 8px;border:1px solid rgba(212,175,55,0.2);border-radius:4px;font-size:0.7rem;font-family:Arial,sans-serif">' + m + '</span>'; }).join('');
      } else {
        modEl.innerHTML = '';
      }
      var btn = document.getElementById('previewBtnDetalhes');
      btn.href = produtoId ? r + '/pages/produto-detalhe.html?id=' + produtoId : '#';
      btn.style.display = 'block';
      panel.classList.add('active');
      aberto = true;
    }

    function fechar() {
      panel.classList.remove('active');
      aberto = false;
    }

    document.querySelectorAll('.dropdown').forEach(function(drop) {
      drop.addEventListener('mouseenter', function() {
        if (window.innerWidth <= 768) return;
        var primeiro = this.querySelector('.dropdown-item');
        if (primeiro) {
          mostrar(primeiro.dataset.name, primeiro.dataset.price, primeiro.dataset.verse, primeiro.dataset.image, null, primeiro.dataset.id);
        }
      });
    });

    document.addEventListener('mouseover', function(e) {
      var item = e.target.closest('.dropdown-item');
      if (item && aberto && window.innerWidth > 768) {
        mostrar(item.dataset.name, item.dataset.price, item.dataset.verse, item.dataset.image, null, item.dataset.id);
      }
    });

    panel.addEventListener('mouseenter', function() {
      // manter aberto
    });

    document.addEventListener('click', function(e) {
      if (aberto && !e.target.closest('.dropdown') && !e.target.closest('.preview-panel') && !e.target.closest('.mega-dropdown-portal')) {
        fechar();
      }
    });
  }

  // ============================================
  // 5. PREVIEW PORTAL (mobile: clique)
  // ============================================
  function setupPreviewPortal() {
    var portal = document.getElementById('previewPortal');
    var overlay = document.getElementById('previewOverlay');

    function abrir(nome, preco, versiculo, imagem, produtoId) {
      document.getElementById('ppName').textContent = nome || 'Produto';
      document.getElementById('ppPrice').textContent = preco || 'R$ 00,00';
      document.getElementById('ppVerse').textContent = versiculo || '';
      var imgEl = document.getElementById('ppImage');
      if (imagem) {
        imgEl.innerHTML = '<img src="' + imagem + '" alt="' + (nome || '') + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px">';
      } else {
        imgEl.innerHTML = '&#x1F455;';
      }
      var btn = document.getElementById('ppBtnDetalhes');
      btn.href = produtoId ? r + '/pages/produto-detalhe.html?id=' + produtoId : '#';
      portal.classList.add('active');
      overlay.classList.add('active');
    }

    function fechar() {
      portal.classList.remove('active');
      overlay.classList.remove('active');
    }

    document.addEventListener('click', function(e) {
      var item = e.target.closest('.dropdown-item');
      if (item && (item.closest('.mega-dropdown') || item.closest('.mega-dropdown-portal'))) {
        e.preventDefault();
        if (window.innerWidth <= 768) {
          abrir(item.dataset.name, item.dataset.price, item.dataset.verse, item.dataset.image, item.dataset.id);
        }
      }
    });

    document.getElementById('ppClose').addEventListener('click', fechar);
    overlay.addEventListener('click', fechar);
  }

  // ============================================
  // 6. CART BADGE
  // ============================================
  function setupCartBadge() {
    function atualizar() {
      var badge = document.getElementById('cartCountNav');
      if (!badge) return;
      try {
        var saved = localStorage.getItem('attos2_carrinho');
        if (saved) {
          var itens = JSON.parse(saved);
          var total = itens.reduce(function(acc, i) { return acc + (i.quantidade || 0); }, 0);
          badge.textContent = total;
          badge.dataset.count = total;
        } else {
          badge.textContent = '0';
          badge.dataset.count = '0';
        }
      } catch(e) {}
    }
    atualizar();
    window.addEventListener('carrinhoAtualizado', atualizar);
  }

  // ============================================
  // 7. SEARCH BAR
  // ============================================
  function setupSearchBar() {
    var bar = document.getElementById('searchBar');
    var input = document.getElementById('searchInput');
    var btn = document.getElementById('searchBtn');
    var go = document.getElementById('searchGo');
    var close = document.getElementById('searchClose');

    function abrir() {
      bar.classList.add('active');
      setTimeout(function() { input.focus(); }, 350);
    }

    function fechar() {
      bar.classList.remove('active');
      input.value = '';
    }

    function buscar() {
      var termo = input.value.trim();
      if (termo) {
        window.location.href = r + '/pages/produtos.html?busca=' + encodeURIComponent(termo);
      }
    }

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      bar.classList.contains('active') ? fechar() : abrir();
    });

    go.addEventListener('click', buscar);
    close.addEventListener('click', fechar);

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') buscar();
      if (e.key === 'Escape') fechar();
    });

    document.addEventListener('click', function(e) {
      if (bar.classList.contains('active') && !e.target.closest('#searchBar') && !e.target.closest('#searchBtn')) {
        fechar();
      }
    });
  }

  // ============================================
  // 8. USER DROPDOWN
  // ============================================
  function setupUserDropdown() {
    var menuBtn = document.getElementById('userMenuBtn');
    var desktopDD = document.getElementById('userDropdown');
    var portalDD = document.getElementById('userDropdownPortal');
    var overlay = document.getElementById('userOverlay');

    // Preencher portal mobile
    portalDD.innerHTML = '<a href="#"><i class="ti ti-user"></i> Minha conta</a>' +
      '<a href="' + r + '/pages/perfil.html"><i class="ti ti-edit"></i> Meu Perfil</a>' +
      '<a href="' + r + '/pages/pedidos.html"><i class="ti ti-package"></i> Meus pedidos</a>' +
      '<hr><a href="#" id="logoutBtnPortal" class="danger"><i class="ti ti-logout"></i> Sair</a>';

    function posicionar() {
      var rect = menuBtn.getBoundingClientRect();
      var top = rect.bottom + 8;
      var left = rect.left;
      if (left + 200 > window.innerWidth - 16) left = window.innerWidth - 200 - 16;
      if (top + 200 > window.innerHeight) top = rect.top - 200 - 8;
      portalDD.style.top = top + 'px';
      portalDD.style.left = left + 'px';
    }

    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (window.innerWidth > 768) {
        desktopDD.classList.toggle('active');
        portalDD.classList.remove('active');
        overlay.classList.remove('active');
      } else {
        if (!portalDD.classList.contains('active')) posicionar();
        portalDD.classList.toggle('active');
        overlay.classList.toggle('active');
        desktopDD.classList.remove('active');
      }
    });

    document.addEventListener('click', function(e) {
      if (window.innerWidth > 768) {
        if (!e.target.closest('.user-dropdown-desktop')) desktopDD.classList.remove('active');
      } else {
        if (!e.target.closest('#userMenuBtn') && !e.target.closest('.user-dropdown-portal')) {
          portalDD.classList.remove('active');
          overlay.classList.remove('active');
        }
      }
    });

    overlay.addEventListener('click', function() {
      portalDD.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  // ============================================
  // 9. AUTH STATE
  // ============================================
  function setupAuth() {
    var portalDD = document.getElementById('userDropdownPortal');
    var overlay = document.getElementById('userOverlay');

    function tryInit() {
      var auth = ensureFirebase() ? window.__attos2_auth : null;
      if (!auth) { setTimeout(tryInit, 500); return; }

      function atualizar() {
        var user = auth.currentUser;
        // Portal mobile
        var plinks = portalDD.querySelectorAll('a');
        var plogout = portalDD.querySelector('#logoutBtnPortal');
        if (user) {
          var nome = user.displayName || user.email || 'Minha conta';
          if (plinks[0]) {
            plinks[0].innerHTML = '<i class="ti ti-user"></i> ' + nome;
            plinks[0].href = '#';
            plinks[0].onclick = function(e) { e.preventDefault(); };
          }
          if (plogout) plogout.style.display = 'flex';
        } else {
          if (plinks[0]) {
            plinks[0].innerHTML = '<i class="ti ti-user"></i> Entrar / Cadastrar';
            plinks[0].href = r + '/pages/login.html';
            plinks[0].onclick = function() { window.location.href = r + '/pages/login.html'; };
          }
          if (plogout) plogout.style.display = 'none';
        }

        // Desktop
        var dd = document.getElementById('userDropdown');
        if (dd) {
          var dlinks = dd.querySelectorAll('a');
          var dlogout = dd.querySelector('#logoutBtn');
          if (user) {
            var nome2 = user.displayName || user.email || 'Minha conta';
            if (dlinks[0]) {
              dlinks[0].innerHTML = '<i class="ti ti-user"></i> ' + nome2;
              dlinks[0].href = '#';
              dlinks[0].onclick = function(e) { e.preventDefault(); };
            }
            if (dlogout) dlogout.style.display = 'flex';
          } else {
            if (dlinks[0]) {
              dlinks[0].innerHTML = '<i class="ti ti-user"></i> Entrar / Cadastrar';
              dlinks[0].href = r + '/pages/login.html';
              dlinks[0].onclick = function() { window.location.href = r + '/pages/login.html'; };
            }
            if (dlogout) dlogout.style.display = 'none';
          }
        }
      }

      auth.onAuthStateChanged(function() { atualizar(); });

      document.addEventListener('click', async function(e) {
        var btn = e.target.closest('#logoutBtnPortal') || e.target.closest('#logoutBtn');
        if (btn) {
          e.preventDefault();
          try {
            await auth.signOut();
            portalDD.classList.remove('active');
            overlay.classList.remove('active');
            atualizar();
          } catch(err) { console.warn('Navbar: erro ao sair:', err); }
        }
      });
    }

    tryInit();
  }

  // ============================================
  // 10. MUSIC PLAYER
  // ============================================
  function setupMusicPlayer() {
    var audio = document.getElementById('bgMusic');
    var btn = document.getElementById('musicBtn');
    var icon = btn.querySelector('i');
    var tocando = true;

    async function carregar() {
      var db = ensureFirebase();
      if (!db) return;
      try {
        var doc = await db.collection('config').doc('loja-config').get();
        if (doc.exists && doc.data().musicaUrl) {
          audio.src = doc.data().musicaUrl;
        } else {
          var url = await firebase.storage().ref('musica/background.mp3').getDownloadURL();
          audio.src = url;
        }
      } catch(e) {
        audio.src = r + '/Gabriela Rocha - Atos 2.mp3';
      }
      audio.play().then(function() {
        btn.classList.add('playing');
        icon.className = 'ti ti-player-pause';
        localStorage.setItem('attos2_music', 'true');
      }).catch(function() {
        tocando = false;
        localStorage.setItem('attos2_music', 'false');
      });
    }

    btn.addEventListener('click', function() {
      if (tocando) {
        audio.pause();
        btn.classList.remove('playing');
        icon.className = 'ti ti-music';
        tocando = false;
        localStorage.setItem('attos2_music', 'false');
      } else {
        audio.play().then(function() {
          btn.classList.add('playing');
          icon.className = 'ti ti-player-pause';
          tocando = true;
          localStorage.setItem('attos2_music', 'true');
        }).catch(function() {});
      }
    });

    carregar();
  }

  // ============================================
  // CARREGAR DROPDOWNS DO FIRESTORE
  // ============================================
  async function carregarDropdowns() {
    var db = ensureFirebase();
    if (!db) return;

    try {
      var snapshot = await db.collection('produtos').get();
      var todos = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        if (data.ativo !== false) {
          todos.push({ id: doc.id, nome: data.nome, preco: data.preco, versiculo: data.versiculo, imagemUrl: data.imagemUrl, modelos: data.modelos, cortes: data.cortes, categoria: data.categoria });
        }
      });

      var ids = { masculino: 'dropdownMasculino', feminino: 'dropdownFeminino', infantil: 'dropdownInfantil' };

      ['masculino', 'feminino', 'infantil'].forEach(function(cat) {
        var container = document.getElementById(ids[cat]);
        if (!container) return;

        var filtrados = todos.filter(function(p) { return (p.categoria || '').toLowerCase() === cat; });

        if (filtrados.length === 0) {
          container.innerHTML = '<div class="dropdown-loading">Nenhum produto disponível</div>';
          return;
        }

        container.innerHTML = filtrados.map(function(p) {
          var preco = (p.preco || 0).toFixed(2).replace('.', ',');
          var modelosStr = '';
          if (p.modelos && Array.isArray(p.modelos)) modelosStr = p.modelos.join(',');
          else if (p.cortes && Array.isArray(p.cortes)) modelosStr = p.cortes.join(',');
          return '<a href="' + r + '/pages/produto-detalhe.html?id=' + p.id + '" class="dropdown-item"' +
            ' data-id="' + p.id + '" data-name="' + (p.nome || '').replace(/"/g,'"') + '"' +
            ' data-price="R$ ' + preco + '" data-verse="' + (p.versiculo || '').replace(/"/g,'"') + '"' +
            ' data-image="' + (p.imagemUrl || '') + '" data-modelos="' + modelosStr + '">' +
            '<div class="item-info"><span class="item-name">' + (p.nome || 'Produto') + '</span>' +
            '<span class="item-verse">' + (p.versiculo || '') + '</span></div>' +
            '<span class="item-price">R$ ' + preco + '</span></a>';
        }).join('');
      });
    } catch(err) {
      console.warn('Navbar: erro ao carregar dropdowns:', err);
      ['dropdownMasculino', 'dropdownFeminino', 'dropdownInfantil'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = '<div class="dropdown-loading">Erro ao carregar</div>';
      });
    }
  }

  // ============================================
  // BOOT: aguardar o DOM e iniciar
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }

})();