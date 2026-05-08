import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    { icon: '🌿', title: 'Sustainability', desc: 'We partner with farms that practice ethical, eco-friendly farming.' },
    { icon: '🤝', title: 'Fair Trade', desc: 'Farmers receive fair compensation for their skill and dedication.' },
    { icon: '✨', title: 'Quality', desc: 'Every batch is hand-selected and rigorously tested before it reaches you.' },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <section className="bg-primary-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Our Story</h1>
          <p className="text-cream-200 text-lg">Bringing the finest teas from across East Africa to your cup</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="font-serif text-3xl font-bold text-espresso-500 mb-4">Rooted in Heritage</h2>
            <p className="text-cream-500 leading-relaxed mb-4">
              Chai Heritage was born out of a deep love for tea and the rich traditions surrounding it in East Africa.
              From the misty highlands of Nandi to the lush slopes of Nyeri, we source our teas directly from small-scale
              farmers who have cultivated these lands for generations.
            </p>
            <p className="text-cream-500 leading-relaxed">
              We believe that every cup of tea tells a story — of the soil, the hands that picked it, and the culture
              that cherishes it. Our mission is to share these stories with tea lovers everywhere.
            </p>
          </div>
          <div className="bg-primary-100 rounded-2xl p-8 text-center">
            <span className="text-8xl">🍵</span>
            <p className="font-serif text-xl font-bold text-primary-500 mt-4">Est. 2020</p>
            <p className="text-cream-500 text-sm">Nairobi, Kenya</p>
          </div>
        </div>

        <h2 className="font-serif text-3xl font-bold text-espresso-500 mb-8 text-center">What We Stand For</h2>
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {values.map(v => (
            <div key={v.title} className="card p-6 text-center">
              <span className="text-5xl block mb-4">{v.icon}</span>
              <h3 className="font-serif text-lg font-bold text-espresso-500 mb-2">{v.title}</h3>
              <p className="text-cream-500 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/shop" className="btn-primary">Explore Our Teas</Link>
        </div>
      </section>
    </div>
  );
};

export default About;
