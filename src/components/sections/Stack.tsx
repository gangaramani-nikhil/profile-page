import { motion } from 'motion/react';
import { Section } from '../ui/Section';
import { stack } from '../../data/profile';

const GROUP_COLORS = ['text-neon', 'text-cyan', 'text-amber'];

export function Stack() {
  return (
    <Section id="stack" num="02" cmd="./stack" title="capabilities">
      <div className="grid gap-6 md:grid-cols-3">
        {stack.map((group, gi) => (
          <motion.div
            key={group.group}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: gi * 0.1 }}
            className="os-panel"
          >
            <div className="os-panel-title">
              <span className={GROUP_COLORS[gi % GROUP_COLORS.length]}>▸</span>
              ls ./{group.group.replace(/[ /]/g, '_')}
            </div>
            <ul className="p-4">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="group flex items-baseline gap-3 border-l border-grid px-3 py-2 transition-colors hover:border-neon/70 hover:bg-neon/5"
                >
                  <span className="shrink-0 text-sm font-semibold text-fg group-hover:text-neon">
                    {item.name}
                  </span>
                  <span className="text-[11px] leading-snug text-dim">{item.note}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
