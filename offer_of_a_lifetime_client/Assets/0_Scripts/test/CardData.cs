using UnityEngine;

[CreateAssetMenu(fileName = "NewCard", menuName = "Game Data/Card Data")]
public class CardData : ScriptableObject
{
    // Name of the card
    public string cardName;
    
    // Description of the card effect
    [TextArea(3, 5)]
    public string description;
    
    // Money cost to play the card
    public int moneyCost;
    
    // Time cost in weeks
    public int timeCostDays;
    
    // Required d20 roll for success
    public int targetRoll;
}