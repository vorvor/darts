<?php

namespace Drupal\darts\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\darts\Game;
use Drupal\darts\Player;
use Drupal\darts\Highlights;
use Drupal\darts\Firstnines;
use Drupal\darts\Matrix;
use Drupal\darts\Tree;
use Drupal\darts\Branch;

use Drupal\darts\GameStat;
use Drupal\node\Entity\Node;

/**
 * Returns responses for darts routes.
 */
class DartsController extends ControllerBase {

  /**
   * Builds the response.
   */
  public function build() {

    $players = Player::getPlayers();

    asort($players);

    $output[] = '<option value="0">Select player</option>';
    foreach ($players as $key => $player) {

      $node = \Drupal\node\Entity\Node::load(Player::getPlayerNid($key));
      $badge = '';
      if ($node->field_2023_newyear_challenge->value == 1) {
        $badge = '🚀';
      }
      

      $output[] = '<option value="' . $key . '">' . $badge . $player . '</option>';
    }

    $selector = '<select id="players">' . implode($output) . '</select>';

    $build['content'] = [
      '#theme' => 'counter',
      '#player_selector' => $selector,
      '#attached' => [
        'library' => [
          'darts/counter',
        ],
        'drupalSettings' => [
          'counter' => [
            'genAvg' =>get_users_general_avg(),
          ],
        ]
      ],
    ];

    return $build;
  }

  public function write($name, $data) {

    // Text log.
    $file = \Drupal::service('extension.list.module')->getPath('darts') . '/data/' . $name . '.txt';
    file_put_contents($file,  $data . PHP_EOL, FILE_APPEND);

    return new JsonResponse([$data]);
  }

  public function writedb($uid, $gameid, $score) {

    // Db log.
    //$user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $newid = darts_write_score($uid, $gameid, $score);

    return new JsonResponse($newid);
  }

  public function deletedb($id) {

    darts_delete_score($id);

    return new JsonResponse(1);
  }

  public function get_last_gameid($uid) {

    $result = darts_get_last_gameid($uid);

    return new JsonResponse($result[0]->gameid);
  }

  public function get_current_user() {

    return new JsonResponse(\Drupal::currentUser()->id());

  }

  public function get_stats_ingame($uid) {
    return $this->get_stats($uid, 'ingame');
  }

  public function get_stats($uid, $style = 'training') {

    /*
    $database = \Drupal::database();

    $query = $database->select('darts', 'd');

    $query
    ->fields('d')
    ->condition('d.uid', 26)
    ->condition('d.score', 180)
    ->orderBy('d.uid', 'DESC')
    ->orderBy('d.gameid', 'DESC')
    ->orderBy('d.id', 'ASC');

    $results = $query->execute()->fetchAll();

    $sum = [];
    foreach ($results as $row) {
      $sum[date('Y-m-d', $row->created)]++;
    }

    foreach ($sum as $k => $v) {
      print $k . ': ' . $v . '<br />';
    }

    die();
    */

    /*
    $players = [
              2 => "Seres Ádám",
              3 => "Földi András",
              5 => "Balogh Sándor",
              6 => "Barna Kss",
              7 => "Nyitrai Bence",
              8 => "Endrei Dávid",
              9 => "Szivos Attila",
              10 => "Gáspár Bálint",
              11 => "Czakó Gergely",
              12 => "Takács Gergő",
              13 => "Horváth Géza",
              14 => "Holló Szabó Zsófi",
              15 => "Szeles Imre",
              16 => "Holló Szabó Lajos",
              17 => "Pál Levente",
              19 => "Margaritovics Márkó",
              20 => "Tóth Norbert",
              21 => "Jimbo",
              22 => "Földi Péter",
              23 => "Illés László",
              24 => "Kaltner Richárd",
              25 => "Rio Róka",
              26 => "Petrovity Sándor",
              27 => "Peter Soma",
              28 => "Pelle Tamas",
              29 => "Varga Dudás István",
              30 => "Vörös Borisz",
              31 => "Török Gergő",
              32 => "Petrovity Márkó",
            ];

  foreach ($players as $uid => $player) {
    
    $node = Node::create([
      'type' => 'player',
      'title' => $player,
      'field_uid' => $uid,
      'field_data' => 'move players to db from code',
    ])->save();
  }
  
  dpm('done.');
  */

    $players = Player::getPlayers();
    $database = \Drupal::database();

    if ($style == 'training') {
      $query = $database->select('darts', 'd');
    }

    if ($style == 'ingame') {
      $query = $database->select('darts_game', 'd');
    }

    $query
    ->fields('d')
    ->orderBy('d.uid', 'DESC')
    ->orderBy('d.gameid', 'DESC')
    ->orderBy('d.id', 'ASC');

    $results = $query->execute()->fetchAll();

    $games = [];
    foreach ($results as $row) {

      $games[$row->uid][$row->gameid]['score'][] = [
        'point' => $row->score,
        'created' => $row->created,
      ];

    }

    $stats = [];
    foreach ($games as $uuid => $game) {

      if ($uuid == 0) {
            continue;
        }
      
      foreach ($game as $gameid => $onegame) {
        $sum = 0;
        $sumtime = 0;
        $i = 0;
        $firstdate = 0;

        if (count($onegame['score']) == 17) {

          foreach ($onegame['score'] as $key => $score) {

            if ($firstdate == 0) {
              $firstdate = $score['created'];
              $diff = 0;
            } else {
              $diff = $score['created'] - $date;
            }
            $date = $score['created'];
            $games[$uuid][$gameid]['score'][$key]['diff'] = $diff;

            $sum += $score['point'];
            $sumtime += $diff;
            $i++;

            $stats[$uuid][date('Y-m-d',$date)][] = $score['point'];
            $stats_per_game[$uuid][date('Y-m-d',$date)][$gameid][] = $score['point'];
          }

          $lastdate = $score['created'];

          $games[$uuid][$gameid]['sum'] = floor(($sum / $i) * 100) / 100;
          if ($i > 1) {
            $games[$uuid][$gameid]['sumtime'] = floor(($sumtime / ($i - 1)) * 100) / 100;
          } else {
            $games[$uuid][$gameid]['sumtime'] = 0;
          }

          $games[$uuid][$gameid]['day'] = date('Y-m-d', $firstdate);
          $games[$uuid][$gameid]['from'] = date('Y-m-d H:i', $firstdate);
          $games[$uuid][$gameid]['to'] = date('H:i', $lastdate);
          $games[$uuid][$gameid]['time'] = floor(($lastdate - $firstdate) / 60);
        }

      }

      $node = \Drupal\node\Entity\Node::load(Player::getPlayerNid($uuid));
      $badge = '';
      if ($node->field_2023_newyear_challenge->value == 1) {
        $badge = '🚀 ';
      }

      $games[$uuid]['name'] = $badge . $players[$uuid];

    }

    // Find daily best avg.
    $all_stat = [];
    foreach ($stats_per_game as $uuid => $stat) {
      foreach ($stat as $day => $oneday) {
        $gamestats = [];
        foreach ($oneday as $gameid => $scores) {
          $gamestats[$gameid] = array_sum($scores) / 17;
        }
        $all_stat[$uuid][$day] = [
          'day_stat' => array_sum($gamestats) / count($gamestats),
          'game_stats' => $gamestats,
        ];
      }
    }
    dpm($all_stat);

    $daily_best = [];
    foreach ($stats_per_game as $uuid => $stat) {
      foreach ($stat as $day => $oneday) {
        $best_avg = 0;
        foreach ($oneday as $gameid => $scores) {
          if (count($scores) == 17) {
            $sum = array_sum($scores) / 17;
            if ($sum > $best_avg) {
              $best_avg = $sum;
            }
          }
        }
        $daily_best[$uuid][$day] = $best_avg;
      }

      $daily_best[$uuid] = array_reverse($daily_best[$uuid]);
    }

    dpm($daily_best);

    $stats_num_of_games = [];
    foreach ($stats as $uuid => $stat) {
      foreach ($stat as $day => $oneday) {
        $stats_num_of_games[$uuid][$day] = count($stats[$uuid][$day]);
        $stats[$uuid][$day] = floor(array_sum($oneday) / count($stats[$uuid][$day]) * 100) / 100;
       
      }

      $stats[$uuid] = array_reverse($stats[$uuid]);
    }

    /*
    foreach ($players as $uid => &$player) {
      $node = \Drupal\node\Entity\Node::load(Player::getPlayerNid($uid));
      if ($node->field_2023_newyear_challenge->value == 1) {
        $player = '🚀 ' . $player;
      }
    }
    */

    // 100+, 80+, 60+ etc. frequency.
    $query = $database->select('darts', 'd');
    $query
    ->fields('d')
    ->orderBy('d.uid', 'DESC')
    ->orderBy('d.gameid', 'DESC')
    ->orderBy('d.id', 'ASC');

    $results = $query->execute()->fetchAll();

    $limits = [100, 80, 60, 40, 20];

    foreach ($results as $row) {
        foreach ($limits as $limit) {
          if ($row->score > $limit) {
            if (isset($weights[$row->uid][$limit])) {
              $weights[$row->uid][$limit]++;
            } else {
              $weights[$row->uid][$limit] = 1;
            }
            if (isset($nw[$row->uid])) {
              $nw[$row->uid]++;
            } else {
              $nw[$row->uid] = 1;
            }

            if ($row->created > 1673222400) {
              if (isset($weights_challenge[$row->uid][$limit])) {
                $weights_challenge[$row->uid][$limit]++;
              } else {
                $weights_challenge[$row->uid][$limit] = 1;
              }

              if (isset($nwc[$row->uid])) {
                $nwc[$row->uid]++;
              } else {
                $nwc[$row->uid] = 1;
              }
            }

            break;
          }
        }
    }

    foreach ($weights as $uid => $weight) {
      foreach ($weight as $limit => $score) {
        $weights_sum[$uid][$limit] = ceil(($score / $nw[$uid]) * 100);
      }
    }

    foreach ($weights_challenge as $uid => $weight) {
      foreach ($weight as $limit => $score) {
        $weights_challenge[$uid][$limit] = ceil(($score / $nwc[$uid]) * 100);
      }
    }

    $build['content'] = [
      '#theme' => 'chart',
      '#scoreboard' => $games,
      '#stats' => $stats,
      '#players' => $players,
      '#weights' => $weights,
      '#attached' => [
        'library' => [
          'darts/chart',
        ],
        'drupalSettings' => [
          'chart' => [
            'test' => $stats,
            'test_num' => $stats_num_of_games,
            'weights' => $weights,
            'weights_sum' => $weights_sum,
            'weights_challenge' => $weights_challenge,
            'daily_best' => $daily_best,
          ],
        ],
      ],
    ];

    return $build;

  }


  public function get_general_stats() {

    $stats = array_merge(
      darts_stats_hard_working(),
      darts_stats_last_game_date(),
      darts_stats_180(),
      darts_stats_best_average(),
      darts_stats_best_first9()
    );

    $build['content'] = [
      '#theme' => 'generalstat',
      '#stats' => $stats,
      '#attached' => [
        'library' => [
          'darts/generalstat',
        ],
      ],
    ];

    return $build;

  }


  public function where() {

    $build['content'] = [
      '#theme' => 'where',
      '#path' => \Drupal::service('extension.list.module')->getPath('darts'),
      '#attached' => [
        'library' => [
          'darts/where',
        ],
      ],
    ];

    return $build;

  }

  /**
   * Builds the response.
   */
  public function game() {

    $players = Player::getPlayers();

    asort($players);

    $optionsA[] = '<option value="0">Select player</option>';
    $optionsB[] = '<option value="0">Select player</option>';
    foreach ($players as $key => $player) {

      $selectedA = '';
      $selectedB = '';
      
      if (isset($_GET['p1']) && $_GET['p1'] == $key) {
        $selectedA = 'selected';
      }
      if (isset($_GET['p2']) && $_GET['p2'] == $key) {
        $selectedB = 'selected';
      }

      $optionsA[] = '<option value="' . $key . '" ' . $selectedA . '>' . $player . '</option>';
      $optionsB[] = '<option value="' . $key . '" ' . $selectedB . '>' . $player . '</option>';
    }

    $selectorA = '<select>' . implode($optionsA) . '</select>';
    $selectorB = '<select>' . implode($optionsB) . '</select>';

    $build['content'] = [
      '#theme' => 'game',
      '#player_selector_a' => $selectorA,
      '#player_selector_b' => $selectorB,
      '#drawid' => (isset($_GET['drawid'])) ? $_GET['drawid'] : 0,
      '#path' => \Drupal::service('extension.list.module')->getPath('darts'),
      '#attached' => [
        'library' => [
          'darts/game',
        ],
      ],
    ];

    return $build;
  }

  public function game_last_id() {
    $last_game_id = darts_get_last_game_gameid();

    if (empty($last_game_id)) {
      return new JsonResponse(1);
    }

    return new JsonResponse($last_game_id[0]->gameid + 1);    
  }

  public function writedbgame($uid, $gameid, $score) {

    // Db log.
    //$user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $newid = darts_game_write_score($uid, $gameid, $score);

    return new JsonResponse($newid);
  }

  public function gameData() {

    $test = new GameStat();


    $games = darts_get_games($_GET['d']);
    $highlights = new Highlights($games);
    $firstnines = new Firstnines($games);

    if ($_GET['d'] == '2022-12-07') {
      $matrix = new Matrix($games);
      $matrix->setFinalLimit(95);
      $matrix->getGamesOfPlayer(30);
      $matrix->getGamesOfPlayer(3);

      $tree = new Tree();
      $tree->addBranch(103, [102, 101]);
      $tree->addBranch(102, [98, 100]);
      $tree->addBranch(101, [99, 96]);

      $drawTree = $tree->generateTree()->tree;

      dpm($drawTree);
    }

    if ($_GET['d'] == '2022-11-30') {
      $matrix = new Matrix($games);
      $matrix->title('(hiányos adatok)');
      $matrix->setFinalLimit(100);

      $matrix->getGamesOfPlayer(26)->removeCells([]);
      $matrix->getGamesOfPlayer(21)->removeCells([15, 9, 20, 30, 3, 10]);

      $drawTree = [];

    }

    if ($_GET['d'] == '2022-12-21') {

      $game = new Game(0);
      $game->players[26] = new Player(26);
      $game->players[21] = new Player(21);
      $game->gameid = 141;
      dpm($game);

      $games[] = $game;


      $matrix = new Matrix($games);
      $matrix->setFinalLimit(141);
      $matrix->getGamesOfPlayer(2);
      $matrix->getGamesOfPlayer(17);

      $tree = new Tree();
      $tree->addBranch(143, [142, 141]);
      $drawTree = $tree->generateTree()->tree;

    }

    

    $build['content'] = [
      '#theme' => 'gamedata',
      '#path' => \Drupal::service('extension.list.module')->getPath('darts'),
      '#day_selector' => darts_list_gamedays(),
      '#date' => date('Y-m-d', $games[0]->legs[1]->throws[0]->time),
      '#games' => $games,
      '#highlights' => $highlights->getTopHighlights(5),
      '#firstnines' => $firstnines->getTopFirstnines(5),
      '#checkouts' => $highlights->getTopCheckouts(5),
      '#matrix' => $matrix,
      '#tree' => $drawTree,
      '#attached' => [
        'library' => [
          'darts/gamedata',
        ],
      ],
    ];

    return $build;
  }

  public function deleteLastScore($gameid) {
    $delete = darts_delete_last_score_of_game($gameid);

    return new JsonResponse($delete);
  }

  public function gameDraw() {

    $playerlist = Player::getPlayers();
    $rand = array_rand($playerlist, 5);

    $players = [];
    foreach ($rand as $r) {
      $players[$r] = $playerlist[$r];
    }
    dpm($players);

    $build['content'] = [
      '#theme' => 'gamedraw',
      '#players' => $players,
      '#attached' => [
        'library' => [
          'darts/gamedraw',
        ],
      ],
    ];

    return $build;

  }

  public function drawTable($did) {

    $database = \Drupal::database();
    $query = $database->select('darts_matrix', 'm');
    $query
    ->fields('m', ['data', 'date'])
    ->orderBy('m.id', 'DESC')
    ->range(0, 1);

    // Show last scoreboard as default.
    if ((int)$did !== 0) {
      $query->condition('m.id', $did);
    }

    $results = $query->execute()->fetchAll();


    $playedGames = $this->getPlayedMatches(date('Y-m-d', $results[0]->date), 15, 30);
    dpm(date('Y-m-d', $results[0]->date));

    $teams = unserialize($results[0]->data);


    // Check if match in progress or played.
    $matchStatuses = [];

    foreach ($teams as $team) {
      foreach ($team as $playerAuid => $nameA) {
        foreach ($team as $playerBuid => $nameB) {
          if ($playerAuid !== $playerBuid) {
            foreach ($playedGames as $game) {

              if (in_array($playerAuid, array_keys($game->players)) && in_array($playerBuid, array_keys($game->players))) {

                $parts = explode('-', $game->result);
                $matchStatuses[$playerAuid . '_' . $playerBuid] = [
                  'result' => $parts[1] . ' - ' . $parts[0],
                  'winner' => $game->winner->uid,
                ];


                
                $matchStatuses[$playerBuid . '_' . $playerAuid] = [
                  'result' => $game->result,
                  'winner' => $game->winner->uid,
                ];


              }
            }
          }
        }
      }
    }

    $build['content'] = [
      '#theme' => 'gamedraw',
      '#teams' => $teams,
      '#matchstatuses' => $matchStatuses,
      '#allplayers' => Player::getPlayers(),
      '#drawid' => $did,
      '#path' => 'scoreboard',
      '#attached' => [
        'library' => [
          'darts/gamedrawtable',
          'darts/menu',
        ],
      ],
    ];

    return $build;
  }

  public function getPlayedMatches($date, $playerA, $playerB) {
    $games = darts_get_games($date);

    if (is_null($games)) {
      return [];
    }

    return $games;
  }

  public function drawTableAddPlayer($did, $team, $uid) {

    $allPlayers = Player::getPlayers();

    $database = \Drupal::database();
    
    $query = $database->select('darts_matrix', 'm');
    $query
    ->fields('m', ['data'])
    ->condition('m.id', $did);
    $results = $query->execute()->fetchAll();
    $teams = unserialize($results[0]->data);

    // Add player.
    $teams[$team][$uid] = $allPlayers[$uid];

    // Update.
    $query = $database->update('darts_matrix');
    $query
    ->fields([ 'data' => serialize($teams) ])
    ->condition('id', $did);
    $result = $query->execute();

    return new JsonResponse($result);    
  }

  public function drawTableRemovePlayer($did, $team, $uid) {

    $allPlayers = Player::getPlayers();

    $database = \Drupal::database();
    
    $query = $database->select('darts_matrix', 'm');
    $query
    ->fields('m', ['data'])
    ->condition('m.id', $did);
    $results = $query->execute()->fetchAll();
    $teams = unserialize($results[0]->data);

    // Remove player.
    unset($teams[$team][$uid]);

    // Update.
    $query = $database->update('darts_matrix');
    $query
    ->fields([ 'data' => serialize($teams) ])
    ->condition('id', $did);
    $result = $query->execute();

    return new JsonResponse($result);    
  }

  public function personalStats($uid) {

    $sums = new GameStat();
    $player_sums = $sums->getSums($uid);

    dpm($player_sums);

    $build['content'] = [
      '#theme' => 'personalstat',
      '#sums' => $player_sums,
      '#attached' => [
        'library' => [
          'darts/counter',
        ],
      ],
    ];

    return $build;
  }

  public function double() {

    $players = Player::getPlayers();

    asort($players);

    $output[] = '<option value="0">Select player</option>';
    foreach ($players as $key => $player) {

      $node = \Drupal\node\Entity\Node::load(Player::getPlayerNid($key));
      $badge = '';
      if ($node->field_2023_newyear_challenge->value == 1) {
        $badge = '🚀';
      }
      

      $output[] = '<option value="' . $key . '">' . $badge . $player . '</option>';
    }

    $selector = '<select id="players">' . implode($output) . '</select>';

    $build['content'] = [
      '#theme' => 'double',
      '#player_selector' => $selector,
      '#attached' => [
        'library' => [
          'darts/double',
        ],
        'drupalSettings' => [
          'counter' => [
            'genAvg' =>get_users_general_avg(),
          ],
        ]
      ],
    ];

    return $build;
  }

  public function getDouble($double) {
    $map = darts_double_map();

    return new JsonResponse($map[$double]);
  }

}


