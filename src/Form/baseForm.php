<?php

namespace Drupal\darts\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a Alap migrate from DB form.
 */
class baseForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'darts_base';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['#attached']['library'][] = 'darts/chart';

    $players = [
      2 => "Seres Ádám",
      3 => "Földi András",
      4 => "Fury Bally",
      5 => "Balogh Sándor",
      6 => "Barna Kss",
      7 => "Nyitrai Bence",
      8 => "Endrei Dávid",
      9 => "Tóth Ferenc",
      10 => "Gáspár Bálint",
      11 => "Czakó Gergely",
      12 => "Takács Gergő",
      13 => "Horváth Géza",
      14 => "Holló Szabó Zsófi",
      15 => "Szeled Imre",
      16 => "Holló Szabó Lajos",
      17 => "Pál Levente",
      18 => "Man Hani",
      19 => "Margaritovics Márkó",
      20 => "Tóth Norbert",
      21 => "Varga Jimbo Norbert",
      22 => "Földi Péter",
      23 => "Petrovity Márkó",
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

      asort($players);

    $form['player'] = [
      '#title' => 'Player',
      '#type' => 'select',
      '#options' => $players,
    ];



    $form['actions'] = [
      '#type' => 'actions',
    ];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    
   

    $this->messenger()->addStatus($this->t('done.'));

    $form_state->setRebuild();

    //$form_state->setRedirect('<front>');
  }

}
