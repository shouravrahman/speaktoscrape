import { Bot, Sparkles, ArrowRight } from 'lucide-react';

export function WelcomeScreen() {
   return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
         <div className="max-w-2xl mx-auto">
            <div className="mb-8">
               <div className="inline-flex items-center justify-center p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
                  <Bot className="w-10 h-10 text-primary" />
               </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
               Agentic Scraper
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
               Your autonomous web scraping agent. Start by describing what you want to scrape.
            </p>

            <div className="space-y-4">
               <h3 className="text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Not sure where to start? Try one of these:
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                     "Scrape Hacker News front page stories",
                     "Get product reviews from Amazon for 'laptops'",
                     "Extract job listings from Indeed with salaries",
                     "Monitor competitor pricing from a list of URLs"
                  ].map((example, index) => (
                     <div key={index} className="p-4 rounded-lg border border-border/50 bg-muted/40 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all duration-200 cursor-pointer">
                        &quot;{example}&quot;
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
