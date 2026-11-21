/* Default Toys page content. Used by (1) the live page when no published CMS content exists / the API is unreachable,
   (2) the admin Toys Page editor, (3) the server-side validator. PUBLIC FILE: never put anything private here. */
(function (root) {
  var D = {
    order: ['hero', 'categories', 'collections', 'popular', 'promo', 'arrivals', 'why', 'life', 'directory', 'final'],
    sections: {
      hero: { enabled: true, eyebrow: 'Vimal27 Toys', headingA: 'Little Moments.', headingB: 'Big Adventures.',
        text: 'Discover a world of imagination, creativity and endless fun. Explore exciting toys made to bring smiles to every little adventure.',
        cta1: { label: 'Explore Toys', href: '#popular' }, cta2: { label: 'Discover Collections', href: '#collections' },
        image: 'images/about-toys.jpg', imageAlt: 'Colourful wooden learning toys including a xylophone, shape sorter and stacking rings',
        labels: ['PLAY MORE', 'IMAGINE MORE', 'EXPLORE MORE'] },
      categories: { enabled: true, eyebrow: 'Shop by category', heading: 'Find Their Next Favourite', subtitle: 'Explore exciting collections for every kind of play.',
        items: [
          { name: 'Remote Control Toys', href: 'rc.html', image: 'images/toys-art/rc.svg', bg: '#EAF8FF', enabled: true },
          { name: 'Cars & Vehicles', href: 'cars.html', image: 'images/toys-art/cars.svg', bg: '#FFF1B8', enabled: true },
          { name: 'Educational Toys', href: 'educational.html', image: 'images/toys-art/educational.svg', bg: '#E8F8EF', enabled: true },
          { name: 'Building Blocks', href: 'building.html', image: 'images/toys-art/building.svg', bg: '#FFF8EA', enabled: true },
          { name: 'Soft Toys', href: 'soft-toys.html', image: 'images/toys-art/soft-toys.svg', bg: '#FFE8EF', enabled: true },
          { name: 'Dolls & Playsets', href: 'dolls.html', image: 'images/toys-art/dolls.svg', bg: '#F0EDFF', enabled: true },
          { name: 'Outdoor Toys', href: 'scooters.html', image: 'images/toys-art/scooters.svg', bg: '#E8F8EF', enabled: true },
          { name: 'Electronic & Robotics', href: 'robotics.html', image: 'images/toys-art/robotics.svg', bg: '#EAF8FF', enabled: true },
          { name: 'Baby Toys', href: 'rattles.html', image: 'images/toys-art/rattles.svg', bg: '#FFF8EA', enabled: true },
          { name: 'Board Games', href: 'board-games.html', image: 'images/toys-art/board-games.svg', bg: '#F0EDFF', enabled: true }
        ] },
      collections: { enabled: true, eyebrow: 'Featured collections', heading: 'Made for Every Kind of Imagination',
        items: [
          { tag: 'Collection', title: 'Speed & Adventure', desc: 'Toy cars and remote-control toys built for fast-paced fun.', href: 'rc.html', image: '', enabled: true },
          { tag: 'Collection', title: 'Learn Through Play', desc: 'Educational toys that turn curiosity into discovery.', href: 'educational.html', image: '', enabled: true },
          { tag: 'Collection', title: 'Cuddle & Smile', desc: 'Soft toys for comfort, cuddles and cosy playtime.', href: 'soft-toys.html', image: '', enabled: true },
          { tag: 'Collection', title: 'Build Your World', desc: 'Building and construction toys for little creators.', href: 'building.html', image: '', enabled: true }
        ] },
      popular: { enabled: true, eyebrow: 'Handpicked', heading: 'Popular Picks', subtitle: 'Discover toys everyone is talking about.', mode: 'auto', featured: [], limit: 8 },
      promo: { enabled: true, eyebrow: 'Vimal27 Toys', headingA: 'Make Every Playtime', headingB: 'Extraordinary',
        text: 'From exciting adventures to creative discoveries, find something special for every moment.', cta: { label: 'Explore All Toys', href: '#categories' }, image: 'images/about-toys.jpg' },
      arrivals: { enabled: true, eyebrow: 'Just in', heading: 'Fresh Finds for Little Explorers' },
      why: { enabled: true, eyebrow: 'Our promise', heading: 'Why Choose Vimal27?',
        items: [
          { icon: 'fa-hand-holding-heart', title: 'Carefully Selected Products', text: 'Toys chosen with play, creativity and everyday fun in mind.' },
          { icon: 'fa-medal', title: 'Quality-Focused Shopping', text: 'We focus on products that feel good to give and good to play with.' },
          { icon: 'fa-bag-shopping', title: 'Convenient Shopping Experience', text: 'Browse, save favourites and check out easily on any device.' },
          { icon: 'fa-headset', title: 'Customer Assistance', text: 'Questions? Reach us on WhatsApp, phone or email anytime.' }
        ] },
      life: { enabled: true, eyebrow: 'Playtime', heading: 'Where Imagination Comes to Life',
        items: [ { label: 'Building blocks, built together', image: '' }, { label: 'RC cars on the track', image: '' }, { label: 'Soft toys in a cosy room', image: '' }, { label: 'Learning toys on a clean table', image: '' } ] },
      directory: { enabled: true, heading: 'All Toy Collections', subtitle: 'Browse every collection and find exactly what you need.' },
      final: { enabled: true, heading: 'Ready for the Next Adventure?', text: 'Explore our collection and discover something wonderful.', cta: { label: 'Explore Toys', href: '#categories' } }
    }
  };
  root.V27_TOYS_DEFAULTS = D;
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
