<?php

namespace Drupal\darts;

class Player {
        public $uid;
        public $name;
        static $players;

        function loadPlayers() {
            $query = \Drupal::entityQuery('node')
            ->condition('type', 'player');
            $results = $query->execute();
            $nodes = \Drupal\node\Entity\Node::loadMultiple($results);

            foreach ($nodes as $node) {
                self::$players[$node->field_uid->getValue()[0]['value']] = $node->getTitle();
            }
        }

        function __construct($uid) {
            $this->loadPlayers();
            $this->uid = $uid;
            $this->name = self::$players[$uid];
        }

        function name() {
            return $this->name;
        }

        static function getPlayers() {
            $query = \Drupal::entityQuery('node')
            ->condition('type', 'player');
            $results = $query->execute();
            $nodes = \Drupal\node\Entity\Node::loadMultiple($results);

            foreach ($nodes as $node) {
                self::$players[$node->field_uid->getValue()[0]['value']] = $node->getTitle();
            }
            
            $players = self::$players;
            asort($players);

            return $players;
        }

        static function getPlayerNid($uid) {
            $query = \Drupal::entityQuery('node')
            ->condition('type', 'player')
            ->condition('field_uid', $uid);
            $results = $query->execute();
            $node = \Drupal\node\Entity\Node::loadMultiple($results);

            if (empty($node)) {
                return null;
            }
            
            return reset($node)->id();


        }

    }