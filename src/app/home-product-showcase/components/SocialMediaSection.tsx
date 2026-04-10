import React from 'react';

interface SocialLink {
  name: string;
  icon: string;
  url: string;
  color: string;
}

const SocialMediaSection = () => {
  const socialLinks: SocialLink[] = [
    {
      name: 'Instagram',
      icon: 'https://cdn.simpleicons.org/instagram/E4405F',
      url: 'https://instagram.com/kamaro',
      color: 'hover:bg-pink-500',
    },
    {
      name: 'X (Twitter)',
      icon: 'https://cdn.simpleicons.org/x/000000',
      url: 'https://x.com/kamaro',
      color: 'hover:bg-slate-900',
    },
    {
      name: 'Snapchat',
      icon: 'https://cdn.simpleicons.org/snapchat/FFFC00',
      url: 'https://snapchat.com/add/kamaro',
      color: 'hover:bg-yellow-400',
    },
  ];

  return (
    <div className="text-center">
      <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4">
        Follow Our Journey
      </h2>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
        Stay connected with Ka-ma-ro on social media for the latest updates, exclusive content, and
        community highlights.
      </p>

      <div className="flex items-center justify-center gap-4">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-center w-14 h-14 bg-card rounded-full elevation-2 hover:elevation-4 transition-smooth ${social.color} touch-target`}
            aria-label={`Follow us on ${social.name}`}
          >
            <img
              src={social.icon}
              alt={`${social.name} icon`}
              className="w-6 h-6 group-hover:scale-110 transition-smooth"
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaSection;
