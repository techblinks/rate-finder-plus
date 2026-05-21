export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      aeo_optimizations: {
        Row: {
          aeo_score: number
          ai_overview_summaries: Json
          answer_confidence_score: number
          conversational_search_queries: Json
          direct_answer_blocks: Json
          faq_improvements: Json
          featured_snippet_paragraphs: Json
          generated_at: string | null
          id: string
          missing_semantic_elements: Json
          page_title: string
          page_url: string
          primary_topic: string
          priority_level: string
          recommended_improvements: Json
          semantic_heading_improvements: Json
          signals: Json
          snippet_readiness_score: number
          status: string
          updated_at: string | null
        }
        Insert: {
          aeo_score: number
          ai_overview_summaries?: Json
          answer_confidence_score: number
          conversational_search_queries?: Json
          direct_answer_blocks?: Json
          faq_improvements?: Json
          featured_snippet_paragraphs?: Json
          generated_at?: string | null
          id?: string
          missing_semantic_elements?: Json
          page_title: string
          page_url: string
          primary_topic: string
          priority_level: string
          recommended_improvements?: Json
          semantic_heading_improvements?: Json
          signals?: Json
          snippet_readiness_score: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          aeo_score?: number
          ai_overview_summaries?: Json
          answer_confidence_score?: number
          conversational_search_queries?: Json
          direct_answer_blocks?: Json
          faq_improvements?: Json
          featured_snippet_paragraphs?: Json
          generated_at?: string | null
          id?: string
          missing_semantic_elements?: Json
          page_title?: string
          page_url?: string
          primary_topic?: string
          priority_level?: string
          recommended_improvements?: Json
          semantic_heading_improvements?: Json
          signals?: Json
          snippet_readiness_score?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      auto_refresh_recommendations: {
        Row: {
          freshness_score: number
          freshness_signals: Json
          generated_at: string | null
          id: string
          last_updated_date: string | null
          last_updated_management: Json
          outdated_sections: Json
          page_title: string
          page_type: string
          page_url: string
          priority_level: string
          recommended_updates: Json
          stale_content_alerts: Json
          status: string
          suggested_updates: Json
          updated_at: string | null
        }
        Insert: {
          freshness_score: number
          freshness_signals?: Json
          generated_at?: string | null
          id?: string
          last_updated_date?: string | null
          last_updated_management?: Json
          outdated_sections?: Json
          page_title: string
          page_type: string
          page_url: string
          priority_level: string
          recommended_updates?: Json
          stale_content_alerts?: Json
          status?: string
          suggested_updates?: Json
          updated_at?: string | null
        }
        Update: {
          freshness_score?: number
          freshness_signals?: Json
          generated_at?: string | null
          id?: string
          last_updated_date?: string | null
          last_updated_management?: Json
          outdated_sections?: Json
          page_title?: string
          page_type?: string
          page_url?: string
          priority_level?: string
          recommended_updates?: Json
          stale_content_alerts?: Json
          status?: string
          suggested_updates?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      calculation_leads: {
        Row: {
          calculator_type: string
          created_at: string
          email: string
          id: string
          inputs: Json
          result_summary: string | null
          suburb: string | null
        }
        Insert: {
          calculator_type: string
          created_at?: string
          email: string
          id?: string
          inputs?: Json
          result_summary?: string | null
          suburb?: string | null
        }
        Update: {
          calculator_type?: string
          created_at?: string
          email?: string
          id?: string
          inputs?: Json
          result_summary?: string | null
          suburb?: string | null
        }
        Relationships: []
      }
      competitor_pages: {
        Row: {
          category: string | null
          created_at: string | null
          domain: string
          domain_authority_estimate: number | null
          estimated_monthly_traffic: number | null
          id: string
          is_active: boolean | null
          keywords_ranking_for: Json | null
          last_crawled_at: string | null
          page_description: string | null
          page_title: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          domain: string
          domain_authority_estimate?: number | null
          estimated_monthly_traffic?: number | null
          id?: string
          is_active?: boolean | null
          keywords_ranking_for?: Json | null
          last_crawled_at?: string | null
          page_description?: string | null
          page_title?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          domain?: string
          domain_authority_estimate?: number | null
          estimated_monthly_traffic?: number | null
          id?: string
          is_active?: boolean | null
          keywords_ranking_for?: Json | null
          last_crawled_at?: string | null
          page_description?: string | null
          page_title?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      competitor_tracking_insights: {
        Row: {
          competitor_domain: string
          competitor_growth_alerts: Json
          competitor_url: string | null
          content_gap_opportunities: Json
          content_trend_alerts: Json
          detected_topic: string
          estimated_opportunity: string
          generated_at: string | null
          id: string
          insight_type: string
          new_topic_alerts: Json
          priority_score: number
          ranking_opportunity_alerts: Json
          recommended_response: string
          signals: Json
          status: string
          updated_at: string | null
        }
        Insert: {
          competitor_domain: string
          competitor_growth_alerts?: Json
          competitor_url?: string | null
          content_gap_opportunities?: Json
          content_trend_alerts?: Json
          detected_topic: string
          estimated_opportunity: string
          generated_at?: string | null
          id?: string
          insight_type: string
          new_topic_alerts?: Json
          priority_score: number
          ranking_opportunity_alerts?: Json
          recommended_response: string
          signals?: Json
          status?: string
          updated_at?: string | null
        }
        Update: {
          competitor_domain?: string
          competitor_growth_alerts?: Json
          competitor_url?: string | null
          content_gap_opportunities?: Json
          content_trend_alerts?: Json
          detected_topic?: string
          estimated_opportunity?: string
          generated_at?: string | null
          id?: string
          insight_type?: string
          new_topic_alerts?: Json
          priority_score?: number
          ranking_opportunity_alerts?: Json
          recommended_response?: string
          signals?: Json
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_drafts: {
        Row: {
          brief: Json | null
          category: string | null
          content: string | null
          created_at: string
          generated_by: string | null
          id: string
          keyword_impressions: number | null
          keyword_opportunity: number | null
          keyword_position: number | null
          meta_description: string | null
          meta_title: string | null
          notes: string | null
          published_at: string | null
          reviewed_by: string | null
          seo_score: number | null
          slug: string | null
          status: string
          target_keyword: string | null
          title: string
          updated_at: string
          word_count: number | null
        }
        Insert: {
          brief?: Json | null
          category?: string | null
          content?: string | null
          created_at?: string
          generated_by?: string | null
          id?: string
          keyword_impressions?: number | null
          keyword_opportunity?: number | null
          keyword_position?: number | null
          meta_description?: string | null
          meta_title?: string | null
          notes?: string | null
          published_at?: string | null
          reviewed_by?: string | null
          seo_score?: number | null
          slug?: string | null
          status?: string
          target_keyword?: string | null
          title: string
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          brief?: Json | null
          category?: string | null
          content?: string | null
          created_at?: string
          generated_by?: string | null
          id?: string
          keyword_impressions?: number | null
          keyword_opportunity?: number | null
          keyword_position?: number | null
          meta_description?: string | null
          meta_title?: string | null
          notes?: string | null
          published_at?: string | null
          reviewed_by?: string | null
          seo_score?: number | null
          slug?: string | null
          status?: string
          target_keyword?: string | null
          title?: string
          updated_at?: string
          word_count?: number | null
        }
        Relationships: []
      }
      content_gap_opportunities: {
        Row: {
          affected_url: string
          estimated_traffic_opportunity: number
          gap_type: string
          generated_at: string | null
          id: string
          is_quick_win: boolean
          keyword_topic: string | null
          priority_score: number
          signals: Json
          status: string
          suggested_content_type: string
          suggested_fix: string
          suggested_related_pages: Json
          updated_at: string | null
        }
        Insert: {
          affected_url: string
          estimated_traffic_opportunity?: number
          gap_type: string
          generated_at?: string | null
          id?: string
          is_quick_win?: boolean
          keyword_topic?: string | null
          priority_score: number
          signals?: Json
          status?: string
          suggested_content_type?: string
          suggested_fix: string
          suggested_related_pages?: Json
          updated_at?: string | null
        }
        Update: {
          affected_url?: string
          estimated_traffic_opportunity?: number
          gap_type?: string
          generated_at?: string | null
          id?: string
          is_quick_win?: boolean
          keyword_topic?: string | null
          priority_score?: number
          signals?: Json
          status?: string
          suggested_content_type?: string
          suggested_fix?: string
          suggested_related_pages?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      content_optimizations: {
        Row: {
          ai_overview_sections: Json
          calculator_explanation_improvements: Json
          comparison_tables: Json
          direct_answers: Json
          estimated_impact: string
          faq_additions: Json
          finance_examples: Json
          generated_at: string | null
          id: string
          improved_headings: Json
          internal_linking_suggestions: Json
          optimization_score: number
          page_title: string
          page_url: string
          primary_topic: string
          priority_level: string
          recommended_improvements: Json
          semantic_keywords: Json
          signals: Json
          snippet_sections: Json
          status: string
          updated_at: string | null
        }
        Insert: {
          ai_overview_sections?: Json
          calculator_explanation_improvements?: Json
          comparison_tables?: Json
          direct_answers?: Json
          estimated_impact: string
          faq_additions?: Json
          finance_examples?: Json
          generated_at?: string | null
          id?: string
          improved_headings?: Json
          internal_linking_suggestions?: Json
          optimization_score: number
          page_title: string
          page_url: string
          primary_topic: string
          priority_level: string
          recommended_improvements?: Json
          semantic_keywords?: Json
          signals?: Json
          snippet_sections?: Json
          status?: string
          updated_at?: string | null
        }
        Update: {
          ai_overview_sections?: Json
          calculator_explanation_improvements?: Json
          comparison_tables?: Json
          direct_answers?: Json
          estimated_impact?: string
          faq_additions?: Json
          finance_examples?: Json
          generated_at?: string | null
          id?: string
          improved_headings?: Json
          internal_linking_suggestions?: Json
          optimization_score?: number
          page_title?: string
          page_url?: string
          primary_topic?: string
          priority_level?: string
          recommended_improvements?: Json
          semantic_keywords?: Json
          signals?: Json
          snippet_sections?: Json
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ctr_optimizations: {
        Row: {
          clicks_28d: number
          ctr_28d: number
          ctr_opportunity_score: number
          estimated_missed_clicks: number
          generated_at: string | null
          id: string
          impressions_28d: number
          page_url: string
          position: number | null
          primary_keyword: string
          priority_score: number
          reason: string
          signals: Json
          status: string
          suggested_emotional_trigger: string
          suggested_faq_snippet: string
          suggested_featured_snippet_answer: string
          suggested_intro: string
          suggested_meta_description: string
          suggested_search_intent_match: string
          suggested_semantic_improvements: string
          suggested_title: string
          updated_at: string | null
        }
        Insert: {
          clicks_28d?: number
          ctr_28d?: number
          ctr_opportunity_score?: number
          estimated_missed_clicks?: number
          generated_at?: string | null
          id?: string
          impressions_28d?: number
          page_url: string
          position?: number | null
          primary_keyword: string
          priority_score: number
          reason: string
          signals?: Json
          status?: string
          suggested_emotional_trigger?: string
          suggested_faq_snippet: string
          suggested_featured_snippet_answer: string
          suggested_intro: string
          suggested_meta_description: string
          suggested_search_intent_match?: string
          suggested_semantic_improvements?: string
          suggested_title: string
          updated_at?: string | null
        }
        Update: {
          clicks_28d?: number
          ctr_28d?: number
          ctr_opportunity_score?: number
          estimated_missed_clicks?: number
          generated_at?: string | null
          id?: string
          impressions_28d?: number
          page_url?: string
          position?: number | null
          primary_keyword?: string
          priority_score?: number
          reason?: string
          signals?: Json
          status?: string
          suggested_emotional_trigger?: string
          suggested_faq_snippet?: string
          suggested_featured_snippet_answer?: string
          suggested_intro?: string
          suggested_meta_description?: string
          suggested_search_intent_match?: string
          suggested_semantic_improvements?: string
          suggested_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gsc_oauth_tokens: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          refresh_token: string
          scope: string | null
          site_url: string
          token_type: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token: string
          scope?: string | null
          site_url?: string
          token_type?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string
          scope?: string | null
          site_url?: string
          token_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      internal_link_opportunities: {
        Row: {
          generated_at: string | null
          id: string
          priority: string
          reason: string
          relationship_type: string
          signals: Json
          source_page: string
          status: string
          suggested_anchor_text: string
          target_page: string
          updated_at: string | null
        }
        Insert: {
          generated_at?: string | null
          id?: string
          priority: string
          reason: string
          relationship_type?: string
          signals?: Json
          source_page: string
          status?: string
          suggested_anchor_text: string
          target_page: string
          updated_at?: string | null
        }
        Update: {
          generated_at?: string | null
          id?: string
          priority?: string
          reason?: string
          relationship_type?: string
          signals?: Json
          source_page?: string
          status?: string
          suggested_anchor_text?: string
          target_page?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      money_page_scores: {
        Row: {
          generated_at: string | null
          id: string
          money_score: number
          page_title: string
          page_url: string
          reason: string
          recommended_action: string
          related_internal_links_needed: Json
          signals: Json
          status: string
          updated_at: string | null
        }
        Insert: {
          generated_at?: string | null
          id?: string
          money_score: number
          page_title: string
          page_url: string
          reason: string
          recommended_action: string
          related_internal_links_needed?: Json
          signals?: Json
          status?: string
          updated_at?: string | null
        }
        Update: {
          generated_at?: string | null
          id?: string
          money_score?: number
          page_title?: string
          page_url?: string
          reason?: string
          recommended_action?: string
          related_internal_links_needed?: Json
          signals?: Json
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author: string
          body: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
        }
        Insert: {
          author?: string
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
        }
        Update: {
          author?: string
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      programmatic_pages: {
        Row: {
          calculated_result: Json | null
          clicks_28d: number
          created_at: string
          h1: string | null
          id: string
          impressions_28d: number
          intro_text: string | null
          is_active: boolean
          meta_description: string | null
          meta_title: string | null
          page_type: string
          params: Json
          position: number | null
          target_keyword: string | null
          updated_at: string
          url_path: string
        }
        Insert: {
          calculated_result?: Json | null
          clicks_28d?: number
          created_at?: string
          h1?: string | null
          id?: string
          impressions_28d?: number
          intro_text?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          page_type: string
          params: Json
          position?: number | null
          target_keyword?: string | null
          updated_at?: string
          url_path: string
        }
        Update: {
          calculated_result?: Json | null
          clicks_28d?: number
          created_at?: string
          h1?: string | null
          id?: string
          impressions_28d?: number
          intro_text?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          page_type?: string
          params?: Json
          position?: number | null
          target_keyword?: string | null
          updated_at?: string
          url_path?: string
        }
        Relationships: []
      }
      rate_audit_log: {
        Row: {
          category: string
          change_note: string | null
          change_source: string | null
          changed_by: string
          created_at: string | null
          id: string
          key: string
          new_value: Json
          old_value: Json | null
          rate_data_id: string | null
          state: string | null
        }
        Insert: {
          category: string
          change_note?: string | null
          change_source?: string | null
          changed_by: string
          created_at?: string | null
          id?: string
          key: string
          new_value: Json
          old_value?: Json | null
          rate_data_id?: string | null
          state?: string | null
        }
        Update: {
          category?: string
          change_note?: string | null
          change_source?: string | null
          changed_by?: string
          created_at?: string | null
          id?: string
          key?: string
          new_value?: Json
          old_value?: Json | null
          rate_data_id?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_audit_log_rate_data_id_fkey"
            columns: ["rate_data_id"]
            isOneToOne: false
            referencedRelation: "rate_data"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_data: {
        Row: {
          auto_sync: boolean | null
          category: string
          created_at: string | null
          display_label: string | null
          id: string
          is_active: boolean | null
          key: string
          last_changed_at: string | null
          last_verified_at: string | null
          notes: string | null
          previous_value: Json | null
          source_name: string | null
          source_url: string | null
          state: string | null
          sync_source: string | null
          updated_at: string | null
          value: Json
        }
        Insert: {
          auto_sync?: boolean | null
          category: string
          created_at?: string | null
          display_label?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          last_changed_at?: string | null
          last_verified_at?: string | null
          notes?: string | null
          previous_value?: Json | null
          source_name?: string | null
          source_url?: string | null
          state?: string | null
          sync_source?: string | null
          updated_at?: string | null
          value: Json
        }
        Update: {
          auto_sync?: boolean | null
          category?: string
          created_at?: string | null
          display_label?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          last_changed_at?: string | null
          last_verified_at?: string | null
          notes?: string | null
          previous_value?: Json | null
          source_name?: string | null
          source_url?: string | null
          state?: string | null
          sync_source?: string | null
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      semantic_finance_knowledge_graphs: {
        Row: {
          authority_connections: Json
          authority_score: number
          entity_count: number
          entity_edges: Json
          entity_nodes: Json
          entity_relationships: Json
          generated_at: string | null
          graph_key: string
          graph_name: string
          id: string
          missing_entity_coverage: Json
          related_content_recommendations: Json
          relationship_count: number
          semantic_relationships: Json
          signals: Json
          status: string
          suggested_internal_links: Json
          topic_relationships: Json
          updated_at: string | null
        }
        Insert: {
          authority_connections?: Json
          authority_score: number
          entity_count?: number
          entity_edges?: Json
          entity_nodes?: Json
          entity_relationships?: Json
          generated_at?: string | null
          graph_key: string
          graph_name: string
          id?: string
          missing_entity_coverage?: Json
          related_content_recommendations?: Json
          relationship_count?: number
          semantic_relationships?: Json
          signals?: Json
          status?: string
          suggested_internal_links?: Json
          topic_relationships?: Json
          updated_at?: string | null
        }
        Update: {
          authority_connections?: Json
          authority_score?: number
          entity_count?: number
          entity_edges?: Json
          entity_nodes?: Json
          entity_relationships?: Json
          generated_at?: string | null
          graph_key?: string
          graph_name?: string
          id?: string
          missing_entity_coverage?: Json
          related_content_recommendations?: Json
          relationship_count?: number
          semantic_relationships?: Json
          signals?: Json
          status?: string
          suggested_internal_links?: Json
          topic_relationships?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_keywords: {
        Row: {
          adsense_cpc_estimate: number | null
          calcy_clicks_28d: number | null
          calcy_ctr_28d: number | null
          calcy_impressions_28d: number | null
          calcy_position: number | null
          calcy_position_previous: number | null
          calcy_vs_competitor_gap: number | null
          category: string
          content_gap_notes: string | null
          created_at: string | null
          id: string
          intent: string | null
          is_active: boolean | null
          keyword: string
          last_synced_at: string | null
          monthly_search_volume: number | null
          opportunity_score: number | null
          priority: number | null
          recommended_action: string | null
          target_page: string | null
          top_competitor_domain: string | null
          top_competitor_position: number | null
          top_competitor_url: string | null
          trend_data: Json | null
          trend_direction: string | null
          updated_at: string | null
        }
        Insert: {
          adsense_cpc_estimate?: number | null
          calcy_clicks_28d?: number | null
          calcy_ctr_28d?: number | null
          calcy_impressions_28d?: number | null
          calcy_position?: number | null
          calcy_position_previous?: number | null
          calcy_vs_competitor_gap?: number | null
          category: string
          content_gap_notes?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          is_active?: boolean | null
          keyword: string
          last_synced_at?: string | null
          monthly_search_volume?: number | null
          opportunity_score?: number | null
          priority?: number | null
          recommended_action?: string | null
          target_page?: string | null
          top_competitor_domain?: string | null
          top_competitor_position?: number | null
          top_competitor_url?: string | null
          trend_data?: Json | null
          trend_direction?: string | null
          updated_at?: string | null
        }
        Update: {
          adsense_cpc_estimate?: number | null
          calcy_clicks_28d?: number | null
          calcy_ctr_28d?: number | null
          calcy_impressions_28d?: number | null
          calcy_position?: number | null
          calcy_position_previous?: number | null
          calcy_vs_competitor_gap?: number | null
          category?: string
          content_gap_notes?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          is_active?: boolean | null
          keyword?: string
          last_synced_at?: string | null
          monthly_search_volume?: number | null
          opportunity_score?: number | null
          priority?: number | null
          recommended_action?: string | null
          target_page?: string | null
          top_competitor_domain?: string | null
          top_competitor_position?: number | null
          top_competitor_url?: string | null
          trend_data?: Json | null
          trend_direction?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_opportunities: {
        Row: {
          generated_at: string | null
          id: string
          keyword: string
          priority: string
          reason: string
          recommended_action: string
          score: number
          signals: Json
          source_keyword_id: string | null
          status: string
          target_url: string
          updated_at: string | null
        }
        Insert: {
          generated_at?: string | null
          id?: string
          keyword: string
          priority: string
          reason: string
          recommended_action: string
          score: number
          signals?: Json
          source_keyword_id?: string | null
          status?: string
          target_url: string
          updated_at?: string | null
        }
        Update: {
          generated_at?: string | null
          id?: string
          keyword?: string
          priority?: string
          reason?: string
          recommended_action?: string
          score?: number
          signals?: Json
          source_keyword_id?: string | null
          status?: string
          target_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_opportunities_source_keyword_id_fkey"
            columns: ["source_keyword_id"]
            isOneToOne: false
            referencedRelation: "seo_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_reports: {
        Row: {
          avg_ctr: number | null
          avg_position: number | null
          biggest_drops: Json | null
          biggest_wins: Json | null
          competitor_alerts: Json | null
          content_recommendations: Json | null
          created_at: string | null
          full_report_data: Json | null
          generated_at: string | null
          id: string
          keywords_declined: number | null
          keywords_improved: number | null
          keywords_new_page1: number | null
          period_end: string | null
          period_start: string | null
          rba_keywords: Json | null
          report_type: string
          top_opportunities: Json | null
          total_clicks_period: number | null
          total_impressions_period: number | null
          total_keywords_tracked: number | null
          trending_keywords: Json | null
        }
        Insert: {
          avg_ctr?: number | null
          avg_position?: number | null
          biggest_drops?: Json | null
          biggest_wins?: Json | null
          competitor_alerts?: Json | null
          content_recommendations?: Json | null
          created_at?: string | null
          full_report_data?: Json | null
          generated_at?: string | null
          id?: string
          keywords_declined?: number | null
          keywords_improved?: number | null
          keywords_new_page1?: number | null
          period_end?: string | null
          period_start?: string | null
          rba_keywords?: Json | null
          report_type: string
          top_opportunities?: Json | null
          total_clicks_period?: number | null
          total_impressions_period?: number | null
          total_keywords_tracked?: number | null
          trending_keywords?: Json | null
        }
        Update: {
          avg_ctr?: number | null
          avg_position?: number | null
          biggest_drops?: Json | null
          biggest_wins?: Json | null
          competitor_alerts?: Json | null
          content_recommendations?: Json | null
          created_at?: string | null
          full_report_data?: Json | null
          generated_at?: string | null
          id?: string
          keywords_declined?: number | null
          keywords_improved?: number | null
          keywords_new_page1?: number | null
          period_end?: string | null
          period_start?: string | null
          rba_keywords?: Json | null
          report_type?: string
          top_opportunities?: Json | null
          total_clicks_period?: number | null
          total_impressions_period?: number | null
          total_keywords_tracked?: number | null
          trending_keywords?: Json | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          ads_txt: string | null
          adsense_auto_ads: boolean
          adsense_client: string | null
          adsense_enabled: boolean
          adsense_slot_header: string | null
          adsense_slot_inline: string | null
          adsense_slot_sidebar: string | null
          adsense_slot_sticky_mobile: string | null
          bing_verification: string | null
          body_html: string | null
          default_meta_description: string | null
          default_og_image: string | null
          favicon_url: string | null
          fb_pixel_id: string | null
          ga4_id: string | null
          gsc_verification: string | null
          gtm_id: string | null
          head_html: string | null
          id: number
          indexing_enabled: boolean
          logo_height: number
          logo_height_mobile: number
          logo_url: string | null
          robots_txt: string | null
          slot_header_enabled: boolean
          slot_inline_enabled: boolean
          slot_sidebar_enabled: boolean
          slot_sticky_mobile_enabled: boolean
          title_template: string
          updated_at: string
        }
        Insert: {
          ads_txt?: string | null
          adsense_auto_ads?: boolean
          adsense_client?: string | null
          adsense_enabled?: boolean
          adsense_slot_header?: string | null
          adsense_slot_inline?: string | null
          adsense_slot_sidebar?: string | null
          adsense_slot_sticky_mobile?: string | null
          bing_verification?: string | null
          body_html?: string | null
          default_meta_description?: string | null
          default_og_image?: string | null
          favicon_url?: string | null
          fb_pixel_id?: string | null
          ga4_id?: string | null
          gsc_verification?: string | null
          gtm_id?: string | null
          head_html?: string | null
          id?: number
          indexing_enabled?: boolean
          logo_height?: number
          logo_height_mobile?: number
          logo_url?: string | null
          robots_txt?: string | null
          slot_header_enabled?: boolean
          slot_inline_enabled?: boolean
          slot_sidebar_enabled?: boolean
          slot_sticky_mobile_enabled?: boolean
          title_template?: string
          updated_at?: string
        }
        Update: {
          ads_txt?: string | null
          adsense_auto_ads?: boolean
          adsense_client?: string | null
          adsense_enabled?: boolean
          adsense_slot_header?: string | null
          adsense_slot_inline?: string | null
          adsense_slot_sidebar?: string | null
          adsense_slot_sticky_mobile?: string | null
          bing_verification?: string | null
          body_html?: string | null
          default_meta_description?: string | null
          default_og_image?: string | null
          favicon_url?: string | null
          fb_pixel_id?: string | null
          ga4_id?: string | null
          gsc_verification?: string | null
          gtm_id?: string | null
          head_html?: string | null
          id?: number
          indexing_enabled?: boolean
          logo_height?: number
          logo_height_mobile?: number
          logo_url?: string | null
          robots_txt?: string | null
          slot_header_enabled?: boolean
          slot_inline_enabled?: boolean
          slot_sidebar_enabled?: boolean
          slot_sticky_mobile_enabled?: boolean
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_log: Json | null
          id: string
          job_type: string
          records_checked: number | null
          records_failed: number | null
          records_updated: number | null
          started_at: string | null
          status: string
          summary: Json | null
          triggered_by: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_log?: Json | null
          id?: string
          job_type: string
          records_checked?: number | null
          records_failed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string
          summary?: Json | null
          triggered_by: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_log?: Json | null
          id?: string
          job_type?: string
          records_checked?: number | null
          records_failed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string
          summary?: Json | null
          triggered_by?: string
        }
        Relationships: []
      }
      topic_cluster_visualizations: {
        Row: {
          alerts: Json
          authority_strength: number
          cluster_key: string
          cluster_name: string
          edge_count: number
          generated_at: string | null
          graph_edges: Json
          graph_nodes: Json
          health_score: number
          id: string
          missing_supporting_content: Json
          node_count: number
          orphan_pages: Json
          semantic_hierarchy: Json
          signals: Json
          status: string
          topical_gaps: Json
          updated_at: string | null
          weak_internal_links: Json
        }
        Insert: {
          alerts?: Json
          authority_strength: number
          cluster_key: string
          cluster_name: string
          edge_count?: number
          generated_at?: string | null
          graph_edges?: Json
          graph_nodes?: Json
          health_score: number
          id?: string
          missing_supporting_content?: Json
          node_count?: number
          orphan_pages?: Json
          semantic_hierarchy?: Json
          signals?: Json
          status?: string
          topical_gaps?: Json
          updated_at?: string | null
          weak_internal_links?: Json
        }
        Update: {
          alerts?: Json
          authority_strength?: number
          cluster_key?: string
          cluster_name?: string
          edge_count?: number
          generated_at?: string | null
          graph_edges?: Json
          graph_nodes?: Json
          health_score?: number
          id?: string
          missing_supporting_content?: Json
          node_count?: number
          orphan_pages?: Json
          semantic_hierarchy?: Json
          signals?: Json
          status?: string
          topical_gaps?: Json
          updated_at?: string | null
          weak_internal_links?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_seo_briefings: {
        Row: {
          approval_status: string
          data_sources: Json
          executive_summary: string
          generated_at: string | null
          growth_opportunities: Json
          id: string
          money_page_priorities: Json
          seo_trend_overview: Json
          top_tasks: Json
          updated_at: string | null
          warnings_issues: Json
          week_start: string
        }
        Insert: {
          approval_status?: string
          data_sources?: Json
          executive_summary: string
          generated_at?: string | null
          growth_opportunities?: Json
          id?: string
          money_page_priorities?: Json
          seo_trend_overview?: Json
          top_tasks?: Json
          updated_at?: string | null
          warnings_issues?: Json
          week_start: string
        }
        Update: {
          approval_status?: string
          data_sources?: Json
          executive_summary?: string
          generated_at?: string | null
          growth_opportunities?: Json
          id?: string
          money_page_priorities?: Json
          seo_trend_overview?: Json
          top_tasks?: Json
          updated_at?: string | null
          warnings_issues?: Json
          week_start?: string
        }
        Relationships: []
      }
      weekly_seo_tasks: {
        Row: {
          affected_url: string
          approval_status: string
          expected_impact: string
          expected_revenue_impact: string | null
          expected_traffic_impact: string | null
          generated_at: string | null
          id: string
          priority_level: string | null
          priority_score: number
          risk_level: string
          source_refs: Json
          suggested_implementation_prompt: string
          task_title: string
          task_type: string
          updated_at: string | null
          week_start: string
        }
        Insert: {
          affected_url: string
          approval_status?: string
          expected_impact: string
          expected_revenue_impact?: string | null
          expected_traffic_impact?: string | null
          generated_at?: string | null
          id?: string
          priority_level?: string | null
          priority_score: number
          risk_level: string
          source_refs?: Json
          suggested_implementation_prompt: string
          task_title: string
          task_type: string
          updated_at?: string | null
          week_start: string
        }
        Update: {
          affected_url?: string
          approval_status?: string
          expected_impact?: string
          expected_revenue_impact?: string | null
          expected_traffic_impact?: string | null
          generated_at?: string | null
          id?: string
          priority_level?: string | null
          priority_score?: number
          risk_level?: string
          source_refs?: Json
          suggested_implementation_prompt?: string
          task_title?: string
          task_type?: string
          updated_at?: string | null
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
